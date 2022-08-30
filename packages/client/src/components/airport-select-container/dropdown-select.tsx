import DropdownSelectItem from "./dropdown-select-item";
import "./dropdown-select.css";

const DropdownSelect = ({ airports, onSelect }: DropdownSelectProps) => {
    return (
        <div className="ds">
            <ul className="ds__list">
                {airports.map((airport) => (
                    <DropdownSelectItem
                        key={airport.id}
                        airportDetail={airport}
                        onSelect={onSelect}
                    />
                ))}
            </ul>
        </div>
    );
};

interface DropdownSelectProps {
    airports: AirportDetail[];
    onSelect: (airportDetail: AirportDetail) => void;
}

interface AirportDetail {
    id: string;
    name: string;
}

export default DropdownSelect;
