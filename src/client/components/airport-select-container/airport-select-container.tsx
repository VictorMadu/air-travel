import React, { useState } from "react";
import DropdownSelect from "../dropdown-select";

const AirportSelectContainer = (props: AirportSelectContainerProps) => {
    const [searchValue, setSearchValue] = useState("");
    const [selectedAirport, setSelectedAirport] = useState("");

    function handleSelect(airportDetail: AirportDetail) {
        props.onSelect(airportDetail.id);
        setSelectedAirport(airportDetail.name);
    }

    return (
        <div>
            <p>{props.title}</p>
            <p>{selectedAirport}</p>
            <div>
                <input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={"Search by Country, City or Lat/Long"}
                />

                <DropdownSelect searchValue={searchValue} onSelect={handleSelect} />
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
