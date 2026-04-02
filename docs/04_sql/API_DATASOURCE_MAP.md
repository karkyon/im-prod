# Web API データソース確定マップ
# 作成日: 2026-04-02
# 旧システム(ACCESS+SQLServer2017)分析完了

## ポリシー
- ストアドプロシジャは呼ばない（HOST_ID()一時テーブルが接続プール非対応のため）
- テーブル・ビューに直接クエリ発行
- 日付整形・金額カンマ整形はNode.js側で実施
- 関数(fn_getWorkInProgressInventory等)は代替SQLで実装

---

## 1. 部品検索一覧 GET /api/parts/search
### テーブル/ビュー
- 部品 (基本情報)
- 在庫 (現在在庫数 - 自部品・共通部品の2回LEFT JOIN)
- 得意先 (得意先名)
- 受注 + 出庫明細 → 注残数（総注残 / 今日現在の注残）
- 生産情報 + 生産進捗 → 入荷予定数・完成期日
- 部品単価 (単価区分=1, MAX適用開始日付の最新単価)
- v_最終棚卸 (最終棚卸日・棚卸数)
- 生産進捗 (仕掛在庫数: 部品IDでCOUNT - fn_getWorkInProgressInventory代替)

### 検索条件パラメータ
- 部品ID, 図面番号, 名称, 得意先ID/名, 主機種型式
- 旧型区分, 特別品区分, 廃止部品区分 (bit)
- 在庫注意フラグ

---

## 2. 部品基本情報 GET /api/parts/:id/basic
### テーブル/ビュー
- v_部品 (部品の拡張ビュー)
- 部品材料 JOIN 材質記号 (材質ID→材質名)
- 在庫 (現在在庫数)
- 在庫 AS 共通部品在庫 (共通部品ID→共通部品在庫数)

---

## 3. 部品備考(4種) GET /api/parts/:id/remarks
### テーブル
- 部品備考 WHERE 種別区分 IN (1,2,3,4)
  - 種別区分=1: 工程用備考
  - 種別区分=2: 注文用備考
  - 種別区分=3: 手配時周知情報
  - 種別区分=4: 出荷用備考
- ORDER BY 整列No

---

## 4. 材料/副資材 GET /api/parts/:id/materials
### テーブル/ビュー
#### 主材料
- 部品材料 JOIN 材質記号 (材質ID→材質)
- 仕入先 (仕入先ID→仕入先名)

#### 材料見積
- 材料見積 WHERE 材料ID = {部品.材料ID}
- 仕入先 (仕入先ID→業者名)

#### 副資材
- 部品副資材
  JOIN 副資材 (副資材ID)
  JOIN v_副資材区分 (副資材区分ID→区分名)
  JOIN v_副資材仕入先 (仕入先ID→仕入先名)

---

## 5. 工程/外注見積 GET /api/parts/:id/processes
### テーブル/ビュー
#### 工程情報
- 部品工程 WHERE 工程ID = {部品.工程ID}
- ORDER BY 工程No

#### 外注加工費見積
- 外注見積 WHERE 部品ID = {partId}

#### マスタ(参照用)
- 外注業者 (担当ID→担当者名)
- 工程記号 (工程記号ID→工程記号)

---

## 6. 生産履歴 GET /api/parts/:id/production-history
### テーブル
- 生産情報 WHERE 部品ID = {partId}
- ORDER BY 生産No DESC

#### 使用材料購入実績(生産Noに紐づく)
- 生産使用材料 JOIN 生産情報
  WHERE 生産情報.生産No = {生産No}

---

## 7. 受注/納品履歴 GET /api/parts/:id/orders
### ビュー
- v_受注納品履歴 WHERE 部品ID = {partId}
- 列: 部品ID, 取引先伝票番号, 受注数量, 納期, 出庫数量,
      出庫日, 入力日, 備考, 納品場所, 単価(整形済), 完納,
      納品状況, 金額(整形済), 検収金額(整形済), 検収日,
      図面番号, 名称, 主機種型式

---

## 8. 入出庫履歴 GET /api/parts/:id/inventory-movements
### UNION 3本
#### 入庫
- 入庫明細
  LEFT JOIN v_入出庫理由 ON 入庫区分=区分No AND 入出='I'
  LEFT JOIN 生産情報 ON 生産番号=生産No
  WHERE 部品ID={partId} AND 削除区分<>'-1'

#### 出庫
- v_出庫明細
  LEFT JOIN v_入出庫理由 ON 出庫区分=区分No AND 入出='O'
  LEFT JOIN 受注 ON 受注番号
  WHERE 部品ID={partId} AND 削除区分<>'-1'

#### 棚卸
- 棚卸 WHERE 部品ID={partId}

- ORDER BY 移動日 DESC

---

## 9. ピッキング履歴 GET /api/parts/:id/picking-history
### ビュー
- v_HT出庫履歴 WHERE CAST(部品ID AS INT) = {partId}
  ※部品ID列がvarchar型のため型変換必要
- 列: 作業日, 作業時刻, IPアドレス, 出荷日, 図面番号,
      部品ID, 数量, 主機種型式, 名称
- ORDER BY 作業日 DESC, 作業時刻 DESC

---

## 10. キャンセル履歴 GET /api/parts/:id/cancellations
### ビュー
- v_キャンセル一覧 WHERE 部品ID = {partId}
- 列: 受注番号, 取引先伝票番号, 受注数量, 出庫数量,
      納期, 出庫日, 単価, 金額, 検収金額, 検収日,
      削除区分, 完納区分, 備考, キャンセル理由, 最終更新日

---

## 11. 単価改定履歴 GET /api/parts/:id/price-history
### テーブル
- 部品単価 WHERE 部品ID = {partId}
- ORDER BY 適用開始日付 DESC
- 列: 部品単価ID, 単価区分, 通貨区分, 単価, 改定日付,
      適用開始日付, 客先担当者, 事由

---

## 12. 製造進捗/仕掛 GET /api/parts/:id/wip
### テーブル
- 生産進捗
  LEFT JOIN 生産情報 ON 生産No
  LEFT JOIN 部品工程 ON 工程ID=生産情報.工程ID AND 進捗1=工程No
  INNER JOIN 部品 ON 部品ID
  INNER JOIN 得意先 ON 得意先ID
  LEFT JOIN 外注加工 (発注No集約) ON 生産No
  WHERE 生産情報.部品ID = {partId}
- 進捗1→工程名変換:
  0='材料', 99='完成', else=部品工程.工程
- 状況変換(進捗2):
  1='加工中', 2='待ち', 3='仕掛保管'

---

## 13. 工程指示図 GET /api/parts/:id/instruction-diagrams
### テーブル
- 工程指示図 WHERE 部品ID = {partId}
- 列: 部品ID, ファイルパス (UNCパス: \\Server2\zumen\...)
- ⚠️ ファイル配信方式は別途設計

---

## ビュー依存関係サマリー（ozzy権限で確認済み）
✅ v_部品
✅ v_出庫明細
✅ v_入出庫理由
✅ v_最終棚卸
✅ v_通貨区分
✅ v_副資材区分
✅ v_副資材仕入先
✅ v_不適合分類
✅ v_共通項目
✅ v_伝票区分
✅ v_キャンセル一覧
✅ v_受注納品履歴
✅ v_HT出庫履歴
✅ v_部品備考
✅ v_部品副資材
✅ v_部品工程
