import { mergeAttributes } from "@/lib/mergeAttributes";
import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { zSchema, categoryAttributeSchema } from "@/lib/zodSchema";
import CategoryModel from "@/models/Category.model";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();
    const payload = await request.json();

    const schema = zSchema
      .pick({ _id: true, name: true, slug: true })
      .extend({ attributes: z.array(categoryAttributeSchema).optional().default([]) });

    const validate = schema.safeParse(payload);
    if (!validate.success) {
      return response(false, 400, "Invalid or missing fields.", validate.error);
    }

    const { _id, name, slug, attributes } = validate.data;
    const parent = payload.parent || null;

    const getCategory = await CategoryModel.findOne({ deletedAt: null, _id });
    if (!getCategory) {
      return response(false, 404, "Data not found.");
    }

    if (parent) {
      if (!isValidObjectId(parent)) {
        return response(false, 400, "Invalid parent category.");
      }
      if (String(parent) === String(_id)) {
        return response(false, 400, "A category cannot be its own parent.");
      }

      // parent exist kare aur khud top-level ho
      const parentDoc = await CategoryModel.findOne({ _id: parent, deletedAt: null }).lean();
      if (!parentDoc) {
        return response(false, 404, "Parent category not found.");
      }
      if (parentDoc.parent) {
        return response(false, 400, "Parent must be a top-level category.");
      }

      // jis category ke andar sub-categories hain wo sub-category nahi ban sakti
      const hasChildren = await CategoryModel.exists({ parent: _id, deletedAt: null });
      if (hasChildren) {
        return response(false, 400, "This category has sub-categories, so it must stay top-level.");
      }
    }

    // Duplicate check (same parent ke andar), khud ko chhod kar
    const existing = await CategoryModel.findOne({
      _id: { $ne: _id },
      parent: parent,
      deletedAt: null,
      $or: [
        { name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" } },
        { slug: slug.trim().toLowerCase() },
      ],
    });

    if (existing) {
      return response(
        false,
        409,
        parent
          ? "A subcategory with this name already exists under the selected category."
          : "A category with this name already exists."
      );
    }

    getCategory.name = name.trim();
    getCategory.slug = slug.trim().toLowerCase();
    getCategory.parent = parent;
    // attributes sirf sub-category ke liye hote hain
    getCategory.attributes = parent ? mergeAttributes(attributes) : []; // same-label attributes merged
    await getCategory.save();

    return response(true, 200, "Category updated successfully.");
  } catch (error) {
    return catchError(error);
  }
}