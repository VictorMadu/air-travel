import { useDropdownSelect } from "./dropdown-select.hooks";

const DropdownSelect = (props: DropdownSelectProps) => {
    const { airportDetails, fetchPreviousAirports, fetchNextAirports } = useDropdownSelect(
        props.searchValue,
        20
    );

    return (
        <div>
            <div>
                <button onClick={fetchPreviousAirports}>Previous</button>
                <button onClick={fetchNextAirports}>Next</button>
            </div>
            <ul>
                {airportDetails.map((airportDetail) => (
                    <li key={airportDetail.id}>
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
