import AirportSelectContainer from "../airport-select-container";
import WeatherCondition from "../weather-condition/weather-condition";
import "./home-page.css";
import { useHomePage } from "./home-page.hooks";

const HomePage = () => {
    const homePage = useHomePage();

    return (
        <div className="home-page">
            <div></div>
            <WeatherCondition />
            <div>
                <div>
                    <h4>{"Booked a Flight"}</h4>
                    <button
                        onClick={() => {
                            console.log("Clicked");
                            homePage.handlePayment();
                        }}
                    >
                        {"Proceed to Payment"}
                    </button>
                </div>
                <div>{homePage.airportDistance}</div>
                <div>
                    <AirportSelectContainer title={"From"} onSelect={homePage.setFromAirportId} />
                    <AirportSelectContainer title={"To"} onSelect={homePage.setToAirportId} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
