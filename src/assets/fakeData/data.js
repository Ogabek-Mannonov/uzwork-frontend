const defaultImg = "https://via.placeholder.com/600x400";
export const projects = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  img: defaultImg,
  title: `Instagram uchun chiroyli reklama post #${i + 1}`,
  description: "SMM uchun tayyor dizayn...",
  tags: ["SMM", "Instagram", "Design"],
  price: "50 000 so'm",
}));
