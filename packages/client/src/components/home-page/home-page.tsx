import AirportSelectContainer from "../airport-select-container";
import WeatherCondition from "../weather-condition/weather-condition";
import "./home-page.css";
import { useHomePage } from "./home-page.hooks";

const HomePage = () => {
    const homePage = useHomePage();
    // TODO: Use redux
    return (
        <div className="hp">
            <WeatherCondition />
            <div className="hp__flight">
                <div className="hp__flight__info">
                    <h6 className="hp__flight__info__title">{"Book a Flight"}</h6>
                    <div className="hp__flight__info__main">
                        <div className="hp__flight__distance">
                            <span className="hp__flight__distance__label text-muted">
                                {"Distance: "}
                            </span>

                            <span className="hp__flight__distance__text">
                                {homePage.airportDistance}
                            </span>
                        </div>
                        <button
                            className="hp__flight__info__pay-btn"
                            onClick={homePage.handlePayment}
                        >
                            {"Proceed to Payment"}
                        </button>
                    </div>
                </div>
                <div className="hp__flight__airports-container">
                    <AirportSelectContainer title={"From"} onSelect={homePage.setFromAirportId} />
                    {/* <AirportSelectContainer title={"To"} onSelect={homePage.setToAirportId} /> */}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
