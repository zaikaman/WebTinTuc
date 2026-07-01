function removeVietnameseTones(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

console.log("Đường sắt ->", removeVietnameseTones("Đường sắt"));
console.log("Thể thao học đường ->", removeVietnameseTones("Thể thao học đường"));
console.log("Bão số 3 miền Trung ->", removeVietnameseTones("Bão số 3 miền Trung"));
