import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

const getInitialCombineSearchData = () => {
    try {
        const persisted = JSON.parse(localStorage.getItem("combinedPersist"));
        return persisted?.combineSearchData || {
            tripType: "oneWay",
            classType: "Economy",
            origin: [],
            destination: [],
            fromDate: dayjs().format("YYYY-MM-DD"),
            toDate: "",
            adultCount: 1,
            childCount: 0,
            infantCount: 0,
        };
    } catch (e) {
        return {
            tripType: "oneWay",
            classType: "Economy",
            origin: [],
            destination: [],
            fromDate: dayjs().format("YYYY-MM-DD"),
            toDate: "",
            adultCount: 1,
            childCount: 0,
            infantCount: 0,
        };
    }
};

const initialState = {
    // Search Results State
    flightAirSearchResp: {},
    flightSearchObj: {},
    selectedFlight: [],
    sessiontimeout: 0,
    status: 0,
    tripType: 'oneWay', // oneWay, roundTrip
    origin: '',
    destination: '',
    // Serialize dates as ISO strings for Redux store
    departureDate: dayjs().add(1, 'day').toISOString(),
    returnDate: dayjs().add(2, 'day').toISOString(),
    passengers: {
        adults: 1,
        children: 0,
        infants: 0
    },
    cabinClass: 'Economy',
    popoverVisible: false,
    airlineMatrixReset: false,
    combineSearchData: getInitialCombineSearchData(),
    flightFilterForSlider: {},
    flightFilters: {
        fareType: [], // ['refundable', 'non-refundable'] or empty for all
        airlines: [],
        maxPrice: null,
        minPrice: 0,
        departureTimeRange: [0, 24],
        arrivalTimeRange: [0, 24],
    },
    // Checkout/Booking State
    airBookReqObj: null,
    mealData: [],
    baggData: [],
    seatData: [],

    otherData: {
        promoData: { PromoID: 0, status: false, Discount: 0 },
        ConvFee: { type: 1, amount: 0 },
        selectedInsuranceData: null,
        redeemAmount: 0,
      
    }
};

const flightSlice = createSlice({
    name: 'flight',
    initialState,
    reducers: {
        setTripType: (state, action) => {
            state.tripType = action.payload;
        },
        setOrigin: (state, action) => {
            state.origin = action.payload;
        },
        setDestination: (state, action) => {
            state.destination = action.payload;
        },
        swapLocations: (state) => {
            const temp = state.origin;
            state.origin = state.destination;
            state.destination = temp;
        },
        setDepartureDate: (state, action) => {
            state.departureDate = action.payload;
        },
        setReturnDate: (state, action) => {
            state.returnDate = action.payload;
        },
        setDates: (state, action) => {
            state.departureDate = action.payload[0];
            state.returnDate = action.payload[1];
        },
        updatePassenger: (state, action) => {
            const { type, operation } = action.payload;
            const currentCount = state.passengers[type];
            let newCount = currentCount;

            if (operation === 'inc') {
                if (state.passengers.adults + state.passengers.children + state.passengers.infants < 9) {
                     newCount = currentCount + 1;
                }
            } else {
                if (currentCount > (type === 'adults' ? 1 : 0)) {
                    newCount = currentCount - 1;
                }
            }
             // Infant constraint: cannot exceed adults
            if (type === 'infants' && newCount > state.passengers.adults) return;
            if (type === 'adults' && state.passengers.infants > newCount) return; // Prevent reducing adults below infants

            state.passengers[type] = newCount;
        },
        setPassengerCount: (state, action) => {
            const { type, count } = action.payload;
            const totalSeats = (type === 'adults' ? count : state.passengers.adults) + 
                               (type === 'children' ? count : state.passengers.children);
            
            // Constraint: Maximum 9 passengers (Adults + Children). Infants usually lap, but let's prevent crazy numbers.
            // Actually GDS allows 9 max usually.
            if (totalSeats > 9) return; 

            if (type === 'adults') {
                state.passengers.adults = count;
                // Auto-adjust infants if they exceed new adult count
                if (state.passengers.infants > count) {
                    state.passengers.infants = count;
                }
            } else if (type === 'children') {
                state.passengers.children = count;
            } else if (type === 'infants') {
                if (count <= state.passengers.adults) {
                    state.passengers.infants = count;
                }
            }
        },
        setCabinClass: (state, action) => {
            state.cabinClass = action.payload;
        },
        togglePopover: (state, action) => {
            state.popoverVisible = action.payload;
        },
        // Search Results Reducers
        setFlightAirSearchResp: (state, action) => {
            state.flightAirSearchResp = action.payload;
        },
        updateFlightAirSearchRespObj: (state, action) => {
             // Assuming this updates the whole object or merges
             state.flightAirSearchResp = { ...state.flightAirSearchResp, ...action.payload };
        },
        setFlightSearchObj: (state, action) => {
            state.flightSearchObj = action.payload;
        },
        updateSelectedFlight: (state, action) => {
            state.selectedFlight = Array.isArray(action.payload) ? action.payload : [action.payload];
        },
        updateFlightFares: (state, action) => {
            // Placeholder logic, update depending on what this does
             // Assuming it updates fare details in selected flight or similar
             // For now just payload
        },
        resetFlightSelectedData: (state) => {
            state.selectedFlight = [];
        },
        setSessionTimeout: (state, action) => {
            state.sessiontimeout = action.payload;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        setLocation: (state, action) => {
            state.location = action.payload;
        },
        setAirlineMatrixReset: (state, action) => {
            state.airlineMatrixReset = action.payload;
        },
        setCombineSearchData: (state, action) => {
            state.combineSearchData = action.payload;
            localStorage.setItem("combinedPersist", JSON.stringify({ combineSearchData: state.combineSearchData }));
        },
        updateCombineSearchData: (state, action) => {
             const { attribute, value } = action.payload;
             state.combineSearchData[attribute] = value;
             localStorage.setItem("combinedPersist", JSON.stringify({ combineSearchData: state.combineSearchData }));
        },
        setFlightFilterForSlider: (state, action) => {
            state.flightFilterForSlider = action.payload;
        },
        setFareTypeFilter: (state, action) => {
            state.flightFilters.fareType = action.payload; // ['refundable', 'non-refundable'] or empty
        },
        setAirlineFilter: (state, action) => {
            state.flightFilters.airlines = action.payload;
        },
        setPriceFilter: (state, action) => {
            const { min, max } = action.payload;
            state.flightFilters.minPrice = min;
            state.flightFilters.maxPrice = max;
        },
        setDepartureTimeFilter: (state, action) => {
            state.flightFilters.departureTimeRange = action.payload;
        },
        setArrivalTimeFilter: (state, action) => {
            state.flightFilters.arrivalTimeRange = action.payload;
        },
        resetFlightFilters: (state) => {
            state.flightFilters = {
                fareType: [],
                airlines: [],
                maxPrice: null,
                minPrice: 0,
                departureTimeRange: [0, 24],
                arrivalTimeRange: [0, 24],
            };
        },
        // Checkout/Booking Reducers
        updateAirBookState: (state, action) => {
            state.airBookReqObj = action.payload;
        },
        updateMealData: (state, action) => {
            state.mealData = action.payload;
        },
        updateBaggageData: (state, action) => {
            state.baggData = action.payload;
        },
        updateSeatData: (state, action) => {
            state.seatData = action.payload;
        },
        // setInsuranceRequired: (state, action) => {
        //     state.insuranceRequired = action.payload;
        // },
        updateOtherData: (state, action) => {
            state.otherData = { ...state.otherData, ...action.payload };
        },
        // setSelectedInsuranceData: (state, action) => {
        //     state.otherData.selectedInsuranceData = action.payload;
        // },
        removePromoConvFee: (state) => {
            state.otherData.promoData = { PromoID: 0, status: false, Discount: 0 };
            state.otherData.ConvFee = { type: 1, amount: 0 };
        },
        addConvFee: (state, action) => {
            // This is a simplified version, as the original API call was commented out
            state.otherData.ConvFee = { type: action.payload.type || 1, amount: action.payload.amount || 0 };
        }
    },
    extraReducers: (builder) => {
        builder.addCase('auth/logout', () => initialState);
    }
});

export const { 
    setTripType, 
    setOrigin, 
    setDestination, 
    swapLocations, 
    setDepartureDate, 
    setReturnDate, 
    setDates, 
    updatePassenger, 
    setPassengerCount,
    setCabinClass, 
    togglePopover,
    setFlightAirSearchResp,
    updateFlightAirSearchRespObj,
    setFlightSearchObj,
    updateSelectedFlight,
    updateFlightFares,
    resetFlightSelectedData,
    setSessionTimeout,
    setStatus,
    setLocation,
    setAirlineMatrixReset,
    setCombineSearchData,
    updateCombineSearchData,
    setFlightFilterForSlider,
    setFareTypeFilter,
    setAirlineFilter,
    setPriceFilter,
    setDepartureTimeFilter,
    setArrivalTimeFilter,
    resetFlightFilters,
    updateAirBookState,
    updateMealData,
    updateBaggageData,
    updateSeatData,
    // setInsuranceRequired,
    updateOtherData,
    // setSelectedInsuranceData,
    removePromoConvFee,
    addConvFee
} = flightSlice.actions;

export default flightSlice.reducer;
