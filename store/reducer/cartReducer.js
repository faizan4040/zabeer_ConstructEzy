import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  count: 0,
  products: [],
};

// Ek cart line = product + variant + (sample ya full). Isse same variant ka
// sample aur full order dono alag-alag cart me reh sakte hain.
const sameLine = (a, b) =>
  a.productId === b.productId &&
  a.variantId === b.variantId &&
  !!a.isSample === !!b.isSample;

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
  clearCart,
} = cartReducer.actions;

export default cartReducer.reducer;
