import { Option, PerPageButton } from "./styles";
import { __, router } from "../../utils/core";
import { useLocation, useNavigate } from "react-router-dom";

import Icon from "../Icon";
import { Menu } from "@headlessui/react";
import React from "react";

type Props = {
  count?: number;
};

// per page chooser component
const PerPageChooser = ({ count }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPerPage = Number(router.getParam(location, "perPage")) || 20;

  const onClick = (perPage) => {
    if (perPage !== currentPerPage) {
      router.setParams(navigate, location, { perPage });
      router.setParams(navigate, location, { page: 1 });

      const storageValue = window.localStorage.getItem("pagination:perPage");

      let items = {};

      if (storageValue) {
        items = JSON.parse(storageValue);
      }

      items[window.location.pathname] = perPage;

      window.localStorage.setItem("pagination:perPage", JSON.stringify(items));
    }
  };

  const renderOption = (n) => {
    return (
      <Option>
        <a href="#number" onClick={onClick.bind(null, n)}>
          {n}
        </a>
      </Option>
    );
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button>
        <PerPageButton>
          {currentPerPage} {__("per page")} <Icon icon="angle-up" />
        </PerPageButton>
      </Menu.Button>
      <Menu.Items className="absolute">
        {renderOption(20)}
        {renderOption(50)}
        {renderOption(100)}
        {renderOption(200)}
      </Menu.Items>
    </Menu>
  );
};

export default PerPageChooser;
