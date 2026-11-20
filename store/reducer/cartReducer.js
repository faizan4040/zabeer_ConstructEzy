import { createSlice } from "@reduxjs/toolkit";
import { cleanCustomSize, customSizeKey, priceForSize } from "@/lib/customSize";

const initialState = {
  count: 0,
  products: [],
};

// Ek cart line = product + variant + (sample ya full). Isse same variant ka
// sample aur full order dono alag-alag cart me reh sakte hain.
const sameLine = (a, b) =>
  a.productId === b.productId &&
  a.variantId === b.variantId &&
  !!a.isSample === !!b.isSample &&
  // same door in two different sizes = two separate lines
  customSizeKey(a.customSize) === customSizeKey(b.customSize);

export const cartReducer = createSlice({
  name: "cartStore",
  initialState,
  reducers: {
    addIntoCart: (state, action) => {
      const payload = action.payload;
      if (!payload) return;

      const existingProduct = state.products.findIndex((product) => sameLine(product, payload));

      if (existingProduct >= 0) {
        // Sample hamesha qty 1 — dobara add karne pe badhta nahi
        if (!payload.isSample) {
          state.products[existingProduct].qty += payload.qty || 1;
        }
      } else {
        state.products.push(payload.isSample ? { ...payload, qty: 1 } : payload);
      }

      state.count = state.products.length;
    },

    increaseQuantity: (state, action) => {
      const existingProduct = state.products.findIndex((product) => sameLine(product, action.payload));

      if (existingProduct >= 0 && !state.products[existingProduct].isSample) {
        state.products[existingProduct].qty += 1;
      }
    },

    decreaseQuantity: (state, action) => {
      const existingProduct = state.products.findIndex((product) => sameLine(product, action.payload));

      if (existingProduct >= 0 && state.products[existingProduct].qty > 1) {
        state.products[existingProduct].qty -= 1;
      }
    },

    removeFromCart: (state, action) => {
      state.products = state.products.filter((product) => !sameLine(product, action.payload));
      state.count = state.products.length;
    },

    // customer adds / changes Height × Width on a cart line. payload: { line, customSize }
    setCustomSize: (state, action) => {
      const { line, customSize } = action.payload || {};
      const size = cleanCustomSize(customSize);
      const idx = state.products.findIndex((p) => sameLine(p, line));
      if (idx < 0 || !size) return;

      const item = state.products[idx];
      const updated = { ...item, customSize: size, sizeMissing: false };
      if (item.priceUnit === "sqft") {
        Object.assign(updated, priceForSize(
          { mrp: item.rateMrp, sellingPrice: item.rateSellingPrice, priceUnit: "sqft" },
          size
        ));
      }

      // same variant already in the cart with this size → merge quantities
      const dup = state.products.findIndex((p, i) => i !== idx && sameLine(p, updated));
      if (dup >= 0) {
        state.products[dup].qty += updated.qty || 1;
        state.products.splice(idx, 1);
      } else {
        state.products[idx] = updated;
      }
      state.count = state.products.length;
    },

    clearCart: (state) => {
      state.products = [];
      state.count = 0;
    },
  },
});

export const {
  addIntoCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  setCustomSize,
  clearCart,
} = cartReducer.actions;

export default cartReducer.reducer;
