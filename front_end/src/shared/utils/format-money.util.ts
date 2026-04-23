export const formatMoney = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};
