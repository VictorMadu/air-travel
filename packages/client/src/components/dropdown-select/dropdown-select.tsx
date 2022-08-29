import { useDropdownSelect } from "./dropdown-select.hooks";
import "./dropdown-select.css";
import DropdownSelectItem from "./dropdown-select-item";

const DropdownSelect = (props: DropdownSelectProps) => {
    const { airportDetails, infiniteParentRef, infinitScrollManager } = useDropdownSelect(
        props.searchValue
    );

    return (
        <div className="ds" ref={infiniteParentRef}>
            <ul className="ds__list">
                {airportDetails.map((airportDetail) => (
                    <DropdownSelectItem
                        key={airportDetail.id}
                        airportDetail={airportDetail}
                        infiniteScrollManager={infinitScrollManager}
                        onSelect={props.onSelect}
                    />
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
