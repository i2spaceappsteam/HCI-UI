export function getHotelPrice(ticketData) {
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

  const checkin = new Date(ticketData.CheckInDate);
  const checkout = new Date(ticketData.CheckOutDate);
  const diffTime = Math.abs(checkout - checkin);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const noOfNights = Number(diffDays);
  const noOfRooms = Number(ticketData.NoOfRooms);
 
  if (ticketData.Rooms.length > 0) {
    let totalBaseFare = ticketData.priceDetails.totalBasePrice

    
    baseAmount = Number(totalBaseFare);
  
     taxAmount = ticketData.priceDetails.totalTax
   
  

    if (
      ticketData?.insuranceRequired === 1 &&
      ticketData?.insuranceData?.serviceType === 2
    ) {
      let totalPax = ticketData.Rooms.reduce(
        (acc, cur) => acc + Number(cur.adultCount) + Number(cur.childCount),
        0
      );
     
      insuranceTotal = totalPax * Number(ticketData?.insuranceData.amount);
    }
  }

  

  totalAmount = Number(taxAmount)+Number(baseAmount);

  if (ticketData?.ConvienceData?.amount) {
    if (ticketData.ConvienceData.type === 1) {
      convienenceFee = Number(ticketData.ConvienceData.amount);
    } else {
      convienenceFee = Number(
        (Number(totalAmount) / 100) *
        Number(
          ticketData.ConvienceData.amount
            ? ticketData.ConvienceData.amount
            : 0
        )
      );
    }
  }

  // if (ticketData.PromoData && ticketData?.PromoData?.DiscountType) {
  if (ticketData.PromoData) {
    if (ticketData.PromoData.DiscountType == 1) {
      discount = Number((totalAmount / 100) * ticketData?.PromoData?.Discount);
    } else {
      discount = Number(ticketData.PromoData.Discount);
    }
  }
  RefundAmount = ticketData.RefundAmount ?? 0;

  grandTotal = Number(
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

export function getHotelPricce(invoiceData) {
  let baseAmount = 0;
  let taxAmount = 0;
  let convienenceFee = 0;
  let discount = 0;
  let RefundAmount = 0;
  let insuranceTotal = 0;
  let totalAmount = 0;
  let grandTotal = 0;

  let postMarkup = 0;
  if (invoiceData?.postMarkup) {
    postMarkup = Number(invoiceData?.postMarkup);
  }

  const checkin = new Date(invoiceData.CheckInDate);
  const checkout = new Date(invoiceData.CheckOutDate);
  const diffTime = Math.abs(checkout - checkin);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const noOfNights = Number(diffDays);
  const noOfRooms = Number(invoiceData.NoOfRooms);

  if (invoiceData.Rooms.length > 0) {
    let totalBaseFare = invoiceData.priceDetails.totalBasePrice

 
    baseAmount = Number(totalBaseFare);
    
    taxAmount = invoiceData.priceDetails.totalTax

    if (
      invoiceData?.insuranceRequired === 1 &&
      invoiceData?.insuranceData?.serviceType === 2
    ) {
      let totalPax = invoiceData.Rooms.reduce(
        (acc, cur) => acc + Number(cur.adultCount) + Number(cur.childCount),
        0
      );
      
      insuranceTotal = totalPax * Number(invoiceData?.insuranceData.amount);
    }
  }


  totalAmount = Number(taxAmount) + Number(baseAmount)

  if (invoiceData?.ConvienceData?.amount) {
    if (invoiceData.ConvienceData.type === 1) {
      convienenceFee = Number(invoiceData.ConvienceData.amount);
    } else {
      convienenceFee = Number(
        (Number(totalAmount) / 100) *
        Number(
          invoiceData.ConvienceData.amount
            ? invoiceData.ConvienceData.amount
            : 0
        )
      );
    }
  }

  // if (invoiceData.PromoData && invoiceData?.PromoData?.DiscountType) {
  if (invoiceData.PromoData) {
    if (invoiceData.PromoData.DiscountType == 1) {
      discount = Number((totalAmount / 100) * invoiceData?.PromoData?.Discount);
    } else {
      discount = Number(invoiceData.PromoData.Discount);
    }
  }
  RefundAmount = invoiceData.RefundAmount ?? 0;

  grandTotal = Number(
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

export const getStatus = (status) => {
  switch (status) {
    case 1: {
      return <span style={{ color: "#FFA500" }}>FAILED</span>;
    }
    case 2: {
      return <span style={{ color: "#008000" }}>CONFIRMED</span>;
    }
    case 3: {
      return <span style={{ color: "#bd0c21" }}>CANCELLED</span>;
    }
    case 4: {
      return <span style={{ color: "#bd0c21" }}>PENDING</span>;
    }
    case 5: {
      return <span style={{ color: "#f9e218" }}>REJECTED</span>;
    }
    case 6: {
      return <span style={{ color: "#bd0c21" }}>HOLD</span>;
    }
    case 7: {
      return <span style={{ color: "#bd0c21" }}>CANCELLATIONREQUESTED</span>;
    }
    case 8: {
      return <span style={{ color: "#bd0c21" }}>CANCELLATIONPENDING</span>;
    }
    case 9: {
      return <span style={{ color: "#bd0c21" }}>CANCELLATIONPROGRESS</span>;
    }
    default:
      return <span></span>;
  }
};
