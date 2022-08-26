import React, { useState, useEffect } from "react";
import { getWeatherDetailsFromUserLocation } from "../../externals/server/air-travel";
import createPartial from "../../partials";
import { DegreeType, WeatherDetails, WeatherOption } from "./weather-condition.types";

type State = WeatherDetails & WeatherOption;

export function useWeatherCondition() {
    const [state, setState] = useState<State>({
        degreeInCelsius: 0,
        degreeInFarenheit: 0,
        weatherType: "",
        humidity: 0,
        region: "",
        country: "",
        lat: 0,
        long: 0,
        weatherIcon: "",
        degreeTypeToShow: DegreeType.celsius,
    });

    useEffect(() => {
        getWeatherDetailsFromUserLocation()
            .then((state) => setState((s) => ({ ...s, ...state })))
            .catch((err) => alert(JSON.stringify(err)));
    }, []);

    const partial = createPartial(state, setState);

    return {
        state: {
            humidity: state.humidity,
            weatherType: state.weatherType,
            weatherIcon: state.weatherIcon,
            region: state.region,
            country: state.country,
            lat: state.lat,
            long: state.long,
            degree: partial.forState(getDegreeToShow),
        },
        helper: {
            shouldEmphasize: partial.forStateFn(shouldEmphasize),
        },
        actions: {
            setDegreeType: partial.forDispatch(setDegreeType),
        },
    };
}

//  =================================== State ========================================
function getDegreeToShow(state: State) {
    return state.degreeTypeToShow === DegreeType.celsius
        ? state.degreeInCelsius
        : state.degreeInFarenheit;
}

//  ======================================= Helpers ==================================
function shouldEmphasize(state: State, degreeType: DegreeType) {
    return state.degreeTypeToShow === degreeType;
}

// =================================== Actions ========================================
function setDegreeType(
    dispatch: React.Dispatch<React.SetStateAction<State>>,
    degreeTypeToShow: DegreeType
) {
    dispatch((s) => ({ ...s, degreeTypeToShow }));
}
