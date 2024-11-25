import { getApi, postApi, putApi, deleteApi } from "./api";

export const getBill = async (conditionQuery) => {
  const response = await getApi(`api::bill.bill`, conditionQuery);
  return response;
};

export const postBill = async (billId, data) => {
  const response = await postApi("api::bill.bill", data);
  return response;
};

export const putBill = async (billId, data) => {
  const response = await putApi(`api::bill.bill/${billId}`, data);
  return response;
};

export const deleteBill = async (billId) => {
  const response = await deleteApi(`api::bill.bill/${billId}`);
  return response;
};

export const getContract = async (conditionQuery) => {
  const response = await getApi(`api::contract.contract`, conditionQuery);
  return response;
};

export const postContract = async (data) => {
  const response = await postApi("api::contract.contract", data);
  return response;
};

export const putContract = async (contractId, data) => {
  const response = await putApi(`api::contract.contract/${contractId}`, data);
  return response;
};

export const deleteContract = async (contractId) => {
  const response = await deleteApi(`api::contract.contract/${contractId}`);
  return response;
};

export const getAdminContracts = async (conditionQuery) => {
  const response = await getApi(`api::contract.contract`, conditionQuery);
  return response;
};

export const postAdminContracts = async (data) => {
  const response = await postApi("api::contract.contract", data);
  return response;
};

export const putAdminContracts = async (contractId, data) => {
  const response = await putApi(`api::contract.contract/${contractId}`, data);
  return response;
};

export const deleteAdminContracts = async (contractId) => {
  const response = await deleteApi(`api::contract.contract/${contractId}`);
  return response;
};

export const getCustomer = async (conditionQuery) => {
  const response = await getApi(`api::customer.customer`, conditionQuery);
  return response;
};

export const postCustomer = async (data) => {
  const response = await postApi("api::customer.customer", data);
  return response;
};

export const putCustomer = async (customerId, data) => {
  const response = await putApi(`api::customer.customer/${customerId}`, data);
  return response;
};

export const deleteCustomer = async (customerId) => {
  const response = await deleteApi(`api::customer.customer/${customerId}`);
  return response;
};

export const getDebt = async (conditionQuery = null) => {
  const response = await getApi(`api::debt.debt`, conditionQuery);
  return response;
};

export const postDebt = async (data) => {
  const response = await postApi("api::debt.debt", data);
  return response;
};

export const putDebt = async (debtId, data) => {
  const response = await putApi(`api::debt.debt/${debtId}`, data);
  return response;
};

export const deleteDebt = async (debtId) => {
  const response = await deleteApi(`api::debt.debt/${debtId}`);
  return response;
};

export const getElectricData = async (conditionQuery) => {
  const response = await getApi(
    `api::electric-data.electric-data`,
    conditionQuery
  );
  return response;
};

export const postElectricData = async (data) => {
  const response = await postApi("api::electric-data.electric-data", data);
  return response;
};

export const putElectricData = async (electricDataId, data) => {
  const response = await putApi(
    `api::electric-data.electric-data/${electricDataId}`,
    data
  );
  return response;
};

export const deleteElectricData = async (electricDataId) => {
  const response = await deleteApi(
    `api::electric-data.electric-data/${electricDataId}`
  );
  return response;
};

export const getHome = async (conditionQuery) => {
  const response = await getApi(`api::home.home`, conditionQuery);
  return response;
};

export const postHome = async (data) => {
  const response = await postApi("api::home.home", data);
  return response;
};

export const putHome = async (homeId, data) => {
  const response = await putApi(`api::home.home/${homeId}`, data);
  return response;
};

export const deleteHome = async (homeId) => {
  const response = await deleteApi(`api::home.home/${homeId}`);
  return response;
};

export const getLandlordAsset = async (conditionQuery) => {
  const response = await getApi(
    `api::landlord-asset.landlord-asset`,
    conditionQuery
  );
  return response;
};

export const postLandlordAsset = async (data) => {
  const response = await postApi("api::landlord-asset.landlord-asset", data);
  return response;
};

export const putLandlordAsset = async (landlordAssetId, data) => {
  const response = await putApi(
    `api::landlord-asset.landlord-asset/${landlordAssetId}`,
    data
  );
  return response;
};

export const deleteLandlordAsset = async (landlordAssetId) => {
  const response = await deleteApi(
    `api::landlord-asset.landlord-asset/${landlordAssetId}`
  );
  return response;
};

export const getLandLordBooking = async (conditionQuery) => {
  const response = await getApi(
    `api::landlord-booking.landlord-booking`,
    conditionQuery
  );
  return response;
};

export const postLandLordBooking = async (data) => {
  const response = await postApi(
    "api::landlord-booking.landlord-booking",
    data
  );
  return response;
};

export const putLandLordBooking = async (landLordBookingId, data) => {
  const response = await putApi(
    `api::landlord-booking.landlord-booking/${landLordBookingId}`,
    data
  );
  return response;
};

export const deleteLandLordBooking = async (landLordBookingId) => {
  const response = await deleteApi(
    `api::landlord-booking.landlord-booking/${landLordBookingId}`
  );
  return response;
};

export const getLandLordInfor = async (conditionQuery) => {
  const response = await getApi(
    `api::landlord-info.landlord-info`,
    conditionQuery
  );
  return response;
};

export const postLandLordInfor = async (data) => {
  const response = await postApi("api::landlord-info.landlord-info", data);
  return response;
};

export const putLandLordInfor = async (landLordInforId, data) => {
  const response = await putApi(
    `api::landlord-info.landlord-info/${landLordInforId}`,
    data
  );
  return response;
};

export const deleteLandLordInfor = async (landLordInforId) => {
  const response = await deleteApi(
    `api::landlord-info.landlord-info/${landLordInforId}`
  );
  return response;
};

export const getMaintenance = async (conditionQuery) => {
  const response = await getApi(`api::maintenance.maintenance`, conditionQuery);
  return response;
};

export const postMaintenance = async (data) => {
  const response = await postApi("api::maintenance.maintenance", data);
  return response;
};

export const putMaintenance = async (maintenanceId, data) => {
  const response = await putApi(
    `api::maintenance.maintenance/${maintenanceId}`,
    data
  );
  return response;
};

export const deleteMaintenance = async (maintenanceId) => {
  const response = await deleteApi(
    `api::maintenance.maintenance/${maintenanceId}`
  );
  return response;
};

export const getNotification = async (conditionQuery) => {
  const response = await getApi(
    `api::notification.notification`,
    conditionQuery
  );
  return response;
};

export const postNotification = async (data) => {
  const response = await postApi("api::notification.notification", data);
  return response;
};

export const putNotification = async (notificationId, data) => {
  const response = await putApi(
    `api::notification.notification/${notificationId}`,
    data
  );
  return response;
};

export const deleteNotification = async (notificationId) => {
  const response = await deleteApi(
    `api::notification.notification/${notificationId}`
  );
  return response;
};

export const getOtherFee = async (conditionQuery) => {
  const response = await getApi(`api::other-fee.other-fee`, conditionQuery);
  return response;
};

export const postOtherFee = async (data) => {
  const response = await postApi("api::other-fee.other-fee", data);
  return response;
};

export const putOtherFee = async (otherFeeId, data) => {
  const response = await putApi(`api::other-fee.other-fee/${otherFeeId}`, data);
  return response;
};

export const deleteOtherFee = async (otherFeeId) => {
  const response = await deleteApi(`api::other-fee.other-fee/${otherFeeId}`);
  return response;
};

export const getRoom = async (conditionQuery) => {
  const response = await getApi(`api::room.room`, conditionQuery);
  return response;
};

export const postRoom = async (data) => {
  const response = await postApi("api::room.room", data);
  return response;
};

export const putRoom = async (roomId, data) => {
  const response = await putApi(`api::room.room/${roomId}`, data);
  return response;
};

export const deleteRoom = async (roomId) => {
  const response = await deleteApi(`api::room.room/${roomId}`);
  return response;
};

export const getService = async (conditionQuery) => {
  const response = await getApi(`api::service.service`, conditionQuery);
  return response;
};

export const postService = async (data) => {
  const response = await postApi("api::service.service", data);
  return response;
};

export const putService = async (serviceId, data) => {
  const response = await putApi(`api::service.service/${serviceId}`, data);
  return response;
};

export const deleteService = async (serviceId) => {
  const response = await deleteApi(`api::service.service/${serviceId}`);
  return response;
};

export const getSetting = async (conditionQuery) => {
  const response = await getApi(`api::setting.setting`, conditionQuery);
  return response;
};

export const postSetting = async (data) => {
  const response = await postApi("api::setting.setting", data);
  return response;
};

export const putSetting = async (settingId, data) => {
  const response = await putApi(`api::setting.setting/${settingId}`, data);
  return response;
};

export const deleteSetting = async (settingId) => {
  const response = await deleteApi(`api::setting.setting/${settingId}`);
  return response;
};

export const getUser = async (conditionQuery) => {
  const response = await getApi(
    `plugin::users-permissions.user`,
    conditionQuery
  );
  return response;
};

export const postUser = async (data) => {
  const response = await postApi("plugin::users-permissions.user", data);
  return response;
};

export const putUser = async (userId, data) => {
  const response = await putApi(
    `plugin::users-permissions.user/${userId}`,
    data
  );
  return response;
};

export const deleteUser = async (userId) => {
  const response = await deleteApi(`plugin::users-permissions.user/${userId}`);
  return response;
};

export const getWaterData = async (conditionQuery) => {
  const response = await getApi(`api::water-data.water-data`, conditionQuery);
  return response;
};

export const postWaterData = async (data) => {
  const response = await postApi("api::water-data.water-data", data);
  return response;
};

export const putWaterData = async (waterDataId, data) => {
  const response = await putApi(
    `api::water-data.water-data/${waterDataId}`,
    data
  );
  return response;
};

export const deleteWaterData = async (waterDataId) => {
  const response = await deleteApi(`api::water-data.water-data/${waterDataId}`);
  return response;
};
