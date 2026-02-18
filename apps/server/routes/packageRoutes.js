import express from "express";
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  reorderPackages,
} from "../controllers/packageController.js";
import { uploadFields } from "../middleware/upload.js";

const router = express.Router();

// Multer field config: one thumbnail + up to 20 inclusion images
const packageUpload = uploadFields.packageFields(20);

router.get("/",           getPackages);
router.get("/:id",        getPackageById);
router.post("/",          packageUpload, createPackage);
router.put("/:id",        packageUpload, updatePackage);
router.delete("/:id",     deletePackage);
router.patch("/reorder",  reorderPackages);  

export default router;