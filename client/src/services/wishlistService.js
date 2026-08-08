// Local storage and session helper for Wishlist items

export const getStoredWishlist = () => {
  try {
    const list = localStorage.getItem('rental_wishlist');
    return list ? JSON.parse(list) : [];
  } catch (e) {
    return [];
  }
};

export const saveWishlist = (items) => {
  localStorage.setItem('rental_wishlist', JSON.stringify(items));
};

export const toggleWishlistItem = (product) => {
  const list = getStoredWishlist();
  const index = list.findIndex((item) => item._id === product._id);
  let updated;
  if (index > -1) {
    updated = list.filter((item) => item._id !== product._id);
  } else {
    updated = [...list, product];
  }
  saveWishlist(updated);
  return updated;
};
