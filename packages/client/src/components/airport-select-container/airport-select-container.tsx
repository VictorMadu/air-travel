import React, { useState } from "react";
import DropdownSelect from "./dropdown-select";
import "./airport-select-container.css";
import { useAirportSelect } from "./airport-select-hook";

const AirportSelectContainer = (props: AirportSelectContainerProps) => {
    const {
        searchValue,
        selectedAirport,
        airportArr,
        airportFetcher,
        handleSearchValueChange,
        handleSelectedAirport,
    } = useAirportSelect({ onSelect: props.onSelect });

    return (
        <div className="asc">
            <p className="asc__title">{props.title}</p>
            {/* TODO: create resuable commponent for the empty space break  */}
            <p className="asc__text">{selectedAirport.name || "\u00A0"}</p>
            <div className="asc__select-container">
                <div className="as__select-container__action">
                    <input
                        className="as__select-container__action__search"
                        value={searchValue}
                        onChange={handleSearchValueChange}
                        placeholder={"Search by Country, City or Lat/Long"}
                    />
                    <div className="as__select-container__action-btns">
                        <button
                            className="as__select-container__btn-prev"
                            onClick={() => airportFetcher.fetchPrev({})}
                        >
                            <span></span>
                        </button>
                        <button
                            className="as__select-container__btn-next"
                            onClick={() => airportFetcher.fetchNext({})}
                        >
                            <span></span>
                        </button>
                    </div>
                </div>
                <div className="asc__select-container__list-container">
                    <DropdownSelect airports={airportArr} onSelect={handleSelectedAirport} />
                </div>
            </div>
        </div>
    );
};

interface AirportSelectContainerProps {
    title: string;
    onSelect: (airport: AirportDetail) => void;
}

interface AirportDetail {
    id: string;
    name: string;
}

export default AirportSelectContainer;
