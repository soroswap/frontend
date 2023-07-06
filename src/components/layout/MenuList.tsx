import React from "react";
import { List } from "@mui/material";
import NavItem from "./NavItem";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import SwapCallsIcon from "@mui/icons-material/SwapCalls";
import AppsIcon from "@mui/icons-material/Apps";

const menuItems = {
  items: [
    {
      id: "default",
      title: "Balances",
      type: "item",
      url: "/",
      icon: AccountBalanceWalletIcon,
      breadcrumbs: false,
    },
    {
      id: "default",
      title: "Mint",
      type: "item",
      url: "/mint",
      icon: AddCircleIcon,
      breadcrumbs: false,
    },
    {
      id: "default",
      title: "Liquidity",
      type: "item",
      url: "/liquidity",
      icon: CurrencyExchangeIcon,
      breadcrumbs: false,
    },
    {
      id: "default",
      title: "Swap",
      type: "item",
      url: "/swap",
      icon: SwapCallsIcon,
      breadcrumbs: false,
    },
    {
      id: "default",
      title: "All",
      type: "item",
      url: "/all",
      icon: AppsIcon,
      breadcrumbs: false,
    },
  ],
};

export default function MenuList() {
  const navItems = menuItems.items.map((item) => {
    return <NavItem key={item.id} item={item} level={1} />;
  });

  return <List>{navItems}</List>;
}
