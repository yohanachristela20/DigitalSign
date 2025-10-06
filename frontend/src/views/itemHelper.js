
export const mapItemsFromFields = ({ signatures, initials, dateField, signClicked, initClicked, dateClicked }) => {
  let items = [];
  const clickedOrder = JSON.parse(localStorage.getItem("clickedFields")) || [];

  for (const type of clickedOrder) {
    if (type === "Signpad" && signClicked && Array.isArray(signatures)) {
      items = [
        ...items,
        ...signatures.map(sig => ({
          jenis_item: "Signpad",
          x_axis: sig.x_axis,
          y_axis: sig.y_axis,
          width: sig.width,
          height: sig.height,
          page: sig.page,
          id_karyawan: sig.id_karyawan,
        }))
      ];
    }

    if (type === "Initialpad" && initClicked && Array.isArray(initials)) {
      items = [
        ...items,
        ...initials.map(sig => ({
          jenis_item: "Initialpad",
          x_axis: sig.x_axis,
          y_axis: sig.y_axis,
          width: sig.width,
          height: sig.height,
          page: sig.page,
          id_karyawan: sig.id_karyawan,
        }))
      ];
    }

    if (type === "Date" && dateClicked && Array.isArray(dateField)) {
      items = [
        ...items,
        ...dateField.map(sig => ({
          jenis_item: "Date",
          x_axis: sig.x_axis,
          y_axis: sig.y_axis,
          width: sig.width,
          height: sig.height,
          page: sig.page,
          id_karyawan: sig.id_karyawan,
        }))
      ];
    }
  }

  return items;
};
