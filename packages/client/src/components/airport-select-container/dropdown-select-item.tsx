import React, { useEffect, useRef } from "react";
import { AirportDetail } from "./airport-select-container.types";

const DropdownSelectItem = ({ airportDetail, onSelect }: DropdownSelectItemProps) => {
    return (
        <li className="ds__list-item">
            <button onClick={() => onSelect(airportDetail)}>{airportDetail.name}</button>
        </li>
    );
};

interface DropdownSelectItemProps {
    airportDetail: AirportDetail;
    onSelect: (airportDetail: AirportDetail) => void;
}

export default DropdownSelectItem;

/* TODO: This whole airport should is meant to be one large hook/feature/reducer. Buttons need to be disabled if  one dropdown has already selected it */
/* TODO: Also error from server needs to be displayed *
    /* TODO: Add arrow that will take user to the top of dropdown */
