const productImages: Record<string, string> = {
  keyboard:
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",

  mouse:
    "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80",

  headphone:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",

  laptop:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",

  phone:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",

  watch:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
};

export const getProductImage = (
  imageUrls?: string[],
  productName?: string
): string => {
  if (imageUrls && imageUrls.length > 0) {
    return `http://localhost:8222${imageUrls[0]}`;
  }

  const name = productName?.toLowerCase() ?? "";

  if (name.includes("keyboard")) {
    return productImages.keyboard;
  }

  if (name.includes("mouse")) {
    return productImages.mouse;
  }

  if (
    name.includes("headphone") ||
    name.includes("headset")
  ) {
    return productImages.headphone;
  }

  if (name.includes("laptop")) {
    return productImages.laptop;
  }

  if (
    name.includes("phone") ||
    name.includes("mobile")
  ) {
    return productImages.phone;
  }

  if (name.includes("watch")) {
    return productImages.watch;
  }

  return productImages.keyboard;
};