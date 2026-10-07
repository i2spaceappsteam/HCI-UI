import React from "react";

export function getHotelPrice(ticketData = {}) {
  let baseAmount = 0;
  let taxAmount = 0;
  let convienenceFee = 0;
  let discount = 0;
  let RefundAmount = 0;
  let insuranceTotal = 0;
  let totalAmount = 0;
  let grandTotal = 0;

  let postMarkup = 0;
  if (ticketData?.postMarkup) {
    postMarkup = Number(ticketData?.postMarkup);
  }

  const checkInDate = ticketData?.CheckInDate || ticketData?.booking?.checkInDate || ticketData?.checkInDate;
  const checkOutDate = ticketData?.CheckOutDate || ticketData?.booking?.checkOutDate || ticketData?.checkOutDate;
  const checkin = checkInDate ? new Date(checkInDate) : new Date();
  const checkout = checkOutDate ? new Date(checkOutDate) : new Date();
  const diffTime = Math.abs(checkout - checkin);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const noOfNights = Number(diffDays) || 1;
  const noOfRooms = Number(ticketData?.NoOfRooms || ticketData?.booking?.noOfRooms || ticketData?.Rooms?.length || 1);

  // Price details lookup across multiple nested properties
  const priceDetails =
    ticketData?.priceDetails ||
    ticketData?.PriceDetails ||
    ticketData?.booking?.priceDetails ||
    ticketData?.booking?.PriceDetails ||
    ticketData?.price ||
    ticketData?.booking?.price ||
    {};

  const rawBase =
    priceDetails?.totalBasePrice ??
    priceDetails?.basePrice ??
    priceDetails?.base ??
    priceDetails?.BasePrice ??
    ticketData?.totalBasePrice ??
    ticketData?.basePrice ??
    ticketData?.BasePrice ??
    ticketData?.booking?.totalBasePrice ??
    ticketData?.booking?.basePrice ??
    0;

  const rawTax =
    priceDetails?.totalTax ??
    priceDetails?.tax ??
    priceDetails?.taxAmount ??
    priceDetails?.Tax ??
    ticketData?.totalTax ??
    ticketData?.tax ??
    ticketData?.Tax ??
    ticketData?.taxAmount ??
    ticketData?.booking?.totalTax ??
    ticketData?.booking?.tax ??
    0;

  baseAmount = Number(rawBase || 0);
  taxAmount = Number(rawTax || 0);

  // Calculate from Rooms array if present and not set
  const roomsList = ticketData?.Rooms || ticketData?.rooms || ticketData?.booking?.rooms || [];
  if (Array.isArray(roomsList) && roomsList.length > 0) {
    if (baseAmount === 0 || taxAmount === 0) {
      let roomBaseSum = 0;
      let roomTaxSum = 0;
      roomsList.forEach((r) => {
        const rPrice = r?.priceDetails || r?.PriceDetails || r?.price || {};
        roomBaseSum += Number(rPrice?.base || rPrice?.basePrice || rPrice?.totalBasePrice || r?.basePrice || 0);
        roomTaxSum += Number(rPrice?.tax || rPrice?.totalTax || rPrice?.otherCharges || r?.tax || 0);
      });
      if (baseAmount === 0 && roomBaseSum > 0) baseAmount = roomBaseSum;
      if (taxAmount === 0 && roomTaxSum > 0) taxAmount = roomTaxSum;
    }

    if (
      ticketData?.insuranceRequired === 1 &&
      ticketData?.insuranceData?.serviceType === 2
    ) {
      let totalPax = roomsList.reduce(
        (acc, cur) => acc + Number(cur?.adultCount || 0) + Number(cur?.childCount || 0),
        0
      );
      insuranceTotal = totalPax * Number(ticketData?.insuranceData?.amount || 0);
    }
  }

  const rawGrandTotal =
    ticketData?.grandTotal ??
    ticketData?.GrandTotal ??
    ticketData?.totalAmount ??
    ticketData?.TotalAmount ??
    ticketData?.booking?.totalAmount ??
    ticketData?.booking?.grandTotal ??
    priceDetails?.total ??
    priceDetails?.totalAmount ??
    0;

  // Fallback: If taxAmount is 0 but rawGrandTotal > baseAmount
  if (taxAmount === 0 && Number(rawGrandTotal) > baseAmount && baseAmount > 0) {
    taxAmount = Number(rawGrandTotal) - baseAmount;
  } else if (baseAmount === 0 && Number(rawGrandTotal) > 0) {
    if (taxAmount > 0 && Number(rawGrandTotal) > taxAmount) {
      baseAmount = Number(rawGrandTotal) - taxAmount;
    } else {
      baseAmount = Number(rawGrandTotal);
    }
  }

  totalAmount = Number(taxAmount) + Number(baseAmount);

  if (ticketData?.ConvienceData?.amount || ticketData?.convienceData?.amount) {
    const convObj = ticketData?.ConvienceData || ticketData?.convienceData;
    if (convObj.type === 1) {
      convienenceFee = Number(convObj.amount || 0);
    } else {
      convienenceFee = Number(
        (Number(totalAmount) / 100) * Number(convObj.amount || 0)
      );
    }
  }

  const promoObj = ticketData?.PromoData || ticketData?.promoData;
  if (promoObj) {
    if (promoObj.DiscountType == 1 || promoObj.discountType == 1) {
      discount = Number((totalAmount / 100) * Number(promoObj.Discount || promoObj.discount || 0));
    } else {
      discount = Number(promoObj.Discount || promoObj.discount || 0);
    }
  }

  RefundAmount = ticketData?.RefundAmount ?? ticketData?.refundAmount ?? 0;

  grandTotal = Number(rawGrandTotal) > 0
    ? Number(rawGrandTotal).toFixed(2)
    : Number(
        baseAmount +
        taxAmount +
        Number(convienenceFee) +
        Number(insuranceTotal) -
        Number(discount)
      ).toFixed(2);

  return {
    baseAmount: Number(baseAmount).toFixed(2),
    taxAmount: Number(taxAmount).toFixed(2),
    convienenceFee: Number(convienenceFee).toFixed(2),
    discount: Number(discount).toFixed(2),
    RefundAmount: Number(RefundAmount).toFixed(2),
    grandTotal,
    insuranceTotal: Number(insuranceTotal).toFixed(2),
    noOfNights,
  };
}

export function getHotelPricce(invoiceData = {}) {
  return getHotelPrice(invoiceData);
}

export const getStatus = (status) => {
  const statusNum = Number(status);
  const statusStr = String(status || "").trim().toLowerCase();

  if (statusNum === 2 || statusStr.includes("confirm")) {
    return <span style={{ color: "#008000" }}>CONFIRMED</span>;
  }
  if (statusNum === 3 || statusStr.includes("cancel")) {
    return <span style={{ color: "#bd0c21" }}>CANCELLED</span>;
  }
  if (statusNum === 1 || statusStr.includes("fail")) {
    return <span style={{ color: "#FFA500" }}>FAILED</span>;
  }
  if (statusNum === 4 || statusStr.includes("pending")) {
    return <span style={{ color: "#bd0c21" }}>PENDING</span>;
  }
  if (statusNum === 5 || statusStr.includes("reject")) {
    return <span style={{ color: "#f9e218" }}>REJECTED</span>;
  }
  if (statusNum === 6 || statusStr.includes("hold")) {
    return <span style={{ color: "#bd0c21" }}>HOLD</span>;
  }
  if (statusNum === 7 || statusStr.includes("request")) {
    return <span style={{ color: "#bd0c21" }}>CANCELLATION REQUESTED</span>;
  }
  if (statusNum === 8) {
    return <span style={{ color: "#bd0c21" }}>CANCELLATION PENDING</span>;
  }
  if (statusNum === 9 || statusStr.includes("progress")) {
    return <span style={{ color: "#bd0c21" }}>CANCELLATION IN PROGRESS</span>;
  }
  if (statusStr) {
    return <span>{String(status).toUpperCase()}</span>;
  }
  return <span></span>;
};
