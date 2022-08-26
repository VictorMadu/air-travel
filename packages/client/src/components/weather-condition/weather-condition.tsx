import React from "react";
import DegreeTypeBtn from "./degree-type-btn";
import OtherDetail from "./other-detail";
import { useWeatherCondition } from "./weather-condition.hook";
import { DegreeType } from "./weather-condition.types";
import "./weather-condition.css";

const WeatherCondition = () => {
    const { state, helper, actions } = useWeatherCondition();
    const degreeTypeBtnCtx = { helper, actions };
    return (
        <div className="wc">
            <div className="wc__detail">
                <h5 className="wc__detail__location">
                    <span>{state.region}</span>, <span>{state.country}</span>
                </h5>
            </div>

            <div className="wc__detail__weather-container">
                <div className="wc__detail__weather">
                    <div className="wc__detail__weather__img">
                        <img src={state.weatherIcon} alt="" />
                    </div>
                    <div className="wc__detail__weather__degree">
                        <h1>{state.degree}</h1>
                    </div>
                    <div className="wc__degree-type-btn-container">
                        <DegreeTypeBtn
                            ctx={degreeTypeBtnCtx}
                            type={DegreeType.celsius}
                            text={"C"}
                        />
                        <DegreeTypeBtn
                            ctx={degreeTypeBtnCtx}
                            type={DegreeType.farenheit}
                            text={"F"}
                        />
                    </div>
                </div>

                <p className="wc__detail__weather__type">{state.weatherType}</p>
            </div>

            <div className="wc__other-detail-container">
                <OtherDetail title={"Humidity"} content={state.humidity} />
                <OtherDetail title={"Lat/Long"} content={`${state.lat}/${state.long}`} />
            </div>
        </div>
    );
};

export default WeatherCondition;
