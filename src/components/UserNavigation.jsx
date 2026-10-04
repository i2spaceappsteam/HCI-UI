import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import Dashboard from './Dashboard';
import MainLayout from './MainLayout';
import Role from './Role';
import NotFound from './NotFound';
import Suppliers from './Suppliers';
import ScreenCategories from './ScreensCategories';
import ScreenMapping from './ScreenMapping';
import Screens from './Screens';
import ClientApiConfig from './ClientApiConfig';
import Membership from './Membership';
import Users from './Users';
import Deposits from './Deposits';
import SiteAdminDeposits from './SiteAdminDeposits';
import Roe from './Roe';

import UserIpConfig from './UserIpConfig';
import CommissionMarkup from './CommissionMarkup';
import HotelResults from "../pages/HotelResults/HotelResults"
import HotelDet from "../pages/HotelDet/NewHotelDet"
import HotelCheckout from "../pages/HotelCheckout/HotelCheckout"
import HotelReview from "../pages/HotelPreview/HotelPreview"
import BookingReports from './BookingReports';
import LedgerStatement from '../pages/LedgerStatement/LedgerStatement';
import ConsolidatedLedger from '../pages/ConsolidatedLedger/ConsolidatedLedger';
import MyProfile from './MyProfile';
import Operator from './Operator/Operator';
import Currency from './Currency';
import Hotels from '../pages/Hotels/Hotels';
import HotelTicketScreen from '../common/AllTickets/Hotel/HotelTicketScreen';


const UserNavigation = () => {
  return (
    <Routes>

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="Admin/Role" element={<Role />} />
        <Route path="Admin/Screens" element={<Screens />} />
        <Route path="Admin/Suppliers" element={<Suppliers />} />
        <Route path="Admin/Categories" element={<ScreenCategories />} />
        <Route path="Admin/ScreenMappings" element={<ScreenMapping />} />
        <Route path="Admin/ClientApiConfig" element={<ClientApiConfig />} />
        <Route path="Admin/Memberships" element={<Membership />} />
        <Route path="Admin/Users" element={<Users />} />
        <Route path="admin/reports" element={<Deposits />} />
        <Route path="admin/siteadmindeposits" element={<SiteAdminDeposits />} />
        <Route path="admin/ROE" element={<Roe />} />
        <Route path="admin/hotels" element={<Hotels />} />

        <Route path="Admin/UserIpConfig" element={<UserIpConfig />} />
        <Route path="Admin/CommissionMarkup" element={<CommissionMarkup />} />

        <Route path="admin/bookingreports" element={<BookingReports />} />
        <Route path="admin/ledgerstatement" element={<LedgerStatement />} />
        <Route path="admin/consolidatedledger" element={<ConsolidatedLedger />} />
        <Route path="myprofile" element={<MyProfile />} />
        <Route path="admin/operator" element={<Operator />} />
        <Route path="admin/currency" element={<Currency />} />
        <Route path="admin/hotelsearch" element={<Hotels />} />
        <Route path="hotels/listing" element={<HotelResults />} />
        <Route path="hotels/detail" element={<HotelDet />} />
        <Route path="hotels/checkout" element={<HotelCheckout />} />
        <Route path="hotels/preview" element={<HotelReview />} />
        <Route path="admin/hotel/ticket" element={<HotelTicketScreen />} />
      </Route>

      {/* Catch all - show NotFound instead of redirecting */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default UserNavigation;
