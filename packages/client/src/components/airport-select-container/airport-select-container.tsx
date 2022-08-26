import React, { useState } from "react";
import DropdownSelect from "../dropdown-select";
import "./airport-select-container.css";

const AirportSelectContainer = (props: AirportSelectContainerProps) => {
    const [state, setState] = useState({ searchValue: "", selectedAirport: "" });

    function handleSelect(airportDetail: AirportDetail) {
        setState((s) => ({ ...s, selectedAirport: airportDetail.name }));
        props.onSelect(airportDetail.id);
    }

    return (
        <div className="asc">
            <p className="asc__title">{props.title}</p>
            {/* TODO: create resuable commponent for the empty space break  */}
            <p className="asc__text">{state.selectedAirport || "\u00A0"}</p>
            <div className="asc__select-container">
                <input
                    className="asc__select-container__search"
                    value={state.searchValue}
                    onChange={(e) => setState((s) => ({ ...s, searchValue: e.target.value }))}
                    placeholder={"Search by Country, City or Lat/Long"}
                />
                <div className="asc__select-container__list-container">
                    <DropdownSelect searchValue={state.searchValue} onSelect={handleSelect} />
                </div>
            </div>
        </div>
    );
};

interface AirportSelectContainerProps {
    title: string;
    onSelect: (airportId: string) => void;
}

interface AirportDetail {
    id: string;
    name: string;
}

export default AirportSelectContainer;
