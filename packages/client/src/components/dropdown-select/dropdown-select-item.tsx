import React, { useEffect, useRef } from "react";
import { AirportDetail } from "./dropdown-select.types";

const DropdownSelectItem = ({
    infiniteScrollManager,
    airportDetail,
    onSelect,
}: DropdownSelectItemProps) => {
    const ref = useRef<HTMLLIElement>(null);
    useEffect(() => {
        if (ref.current == null) return;
        return infiniteScrollManager.attachChild(airportDetail.id, ref.current);
    }, [airportDetail.id, infiniteScrollManager]);

    return (
        <li ref={ref} className="ds__list-item">
            <button onClick={() => onSelect(airportDetail)}>{airportDetail.name}</button>
        </li>
    );
};

interface DropdownSelectItemProps {
    infiniteScrollManager: {
        attachChild(key: string, elm: Element): () => void;
    };
    airportDetail: AirportDetail;
    onSelect: (airportDetail: AirportDetail) => void;
}

export default DropdownSelectItem;

/* TODO: This whole airport should is meant to be one large hook/feature/reducer. Buttons need to be disabled if  one dropdown has already selected it */
/* TODO: Also error from server needs to be displayed *
    /* TODO: Add arrow that will take user to the top of dropdown */
