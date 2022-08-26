import { useDropdownSelect } from "./dropdown-select.hooks";
import "./dropdown-select.css";

const DropdownSelect = (props: DropdownSelectProps) => {
    const { airportDetails, fetchPreviousAirports, fetchNextAirports } = useDropdownSelect(
        props.searchValue,
        20
    );

    return (
        <div className="ds">
            <ul className="ds__list">
                {airportDetails.map((airportDetail) => (
                    <li key={airportDetail.id} className="ds__list-item">
                        <button onClick={() => props.onSelect(airportDetail)}>
                            {airportDetail.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface DropdownSelectProps {
    searchValue: string;
    onSelect: (airportDetail: AirportDetail) => void;
}

interface AirportDetail {
    id: string;
    name: string;
}

export default DropdownSelect;
