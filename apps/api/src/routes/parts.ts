import { Router, Request, Response } from "express";
import { searchParts } from "../repositories/parts.repository.js";
import {
  getPartBasic,
  getPartRemarks,
  getPartMaterials,
  getPartProcesses,
} from "../repositories/part-detail.repository.js";
import {
  getProductionHistory,
  getMaterialPurchaseHistory,
  getOrderDeliveryHistory,
  getInventoryMovements,
  getPickingHistory,
  getCancellations,
  getPriceHistory,
  getWip,
  getInstructionDiagrams,
  getIssues,
} from "../repositories/part-history.repository.js";

const router = Router();

// ─── ヘルパー ──────────────────────────────────────
const pid = (req: Request) => {
  const id = Number(req.params.id);
  return isNaN(id) ? null : id;
};

const err400 = (res: Response) => res.status(400).json({ error: "部品IDが不正です" });
const err500 = (res: Response, e: unknown) => {
  console.error(e);
  res.status(500).json({ error: "サーバーエラーが発生しました" });
};

// ────────────────────────────────────────────────
// GET /api/parts/search
// ────────────────────────────────────────────────
router.get("/search", async (req: Request, res: Response) => {
  try {
    const q = req.query;
    const result = await searchParts({
      keyword:        q.keyword        as string | undefined,
      partId:         q.partId         ? Number(q.partId) : undefined,
      drawingNo:      q.drawingNo      as string | undefined,
      partName:       q.partName       as string | undefined,
      customerId:     q.customerId     ? Number(q.customerId) : undefined,
      customer:       q.customer       as string | undefined,
      machineType:    q.machineType    as string | undefined,
      isOld:          q.isOld          === "true" ? true : q.isOld === "false" ? false : undefined,
      isSpecial:      q.isSpecial      === "true" ? true : q.isSpecial === "false" ? false : undefined,
      isDiscontinued: q.isDiscontinued === "true" ? true : q.isDiscontinued === "false" ? false : undefined,
      hasAlert:       q.hasAlert       === "true",
      page:           q.page           ? Number(q.page)  : 1,
      limit:          q.limit          ? Number(q.limit) : 50,
    });
    res.json(result);
  } catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/basic
// ────────────────────────────────────────────────
router.get("/:id/basic", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try {
    const data = await getPartBasic(id);
    if (!data) return res.status(404).json({ error: "部品が見つかりません" });
    res.json(data);
  } catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/remarks
// ────────────────────────────────────────────────
router.get("/:id/remarks", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getPartRemarks(id)); }
  catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/materials
// ────────────────────────────────────────────────
router.get("/:id/materials", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getPartMaterials(id)); }
  catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/processes
// ────────────────────────────────────────────────
router.get("/:id/processes", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getPartProcesses(id)); }
  catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/production-history
// ────────────────────────────────────────────────
router.get("/:id/production-history", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getProductionHistory(id)); }
  catch (e) { err500(res, e); }
});

// GET /api/parts/:id/production-history/:seisanNo/materials
router.get("/:id/production-history/:seisanNo/materials", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getMaterialPurchaseHistory(req.params.seisanNo)); }
  catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/orders
// ────────────────────────────────────────────────
router.get("/:id/orders", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getOrderDeliveryHistory(id)); }
  catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/inventory-movements
// ────────────────────────────────────────────────
router.get("/:id/inventory-movements", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getInventoryMovements(id)); }
  catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/picking-history
// ────────────────────────────────────────────────
router.get("/:id/picking-history", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getPickingHistory(id)); }
  catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/cancellations
// ────────────────────────────────────────────────
router.get("/:id/cancellations", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getCancellations(id)); }
  catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/price-history
// ────────────────────────────────────────────────
router.get("/:id/price-history", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getPriceHistory(id)); }
  catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/wip
// ────────────────────────────────────────────────
router.get("/:id/wip", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getWip(id)); }
  catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/instruction-diagrams
// ────────────────────────────────────────────────
router.get("/:id/instruction-diagrams", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getInstructionDiagrams(id)); }
  catch (e) { err500(res, e); }
});

// ────────────────────────────────────────────────
// GET /api/parts/:id/issues   ← F-08 追加
// ────────────────────────────────────────────────
router.get("/:id/issues", async (req, res) => {
  const id = pid(req);
  if (!id) return err400(res);
  try { res.json(await getIssues(id)); }
  catch (e) { err500(res, e); }
});

export default router;