import { useEffect, useState } from "react";
import { calculateDistanceBtw, placeTravelOrder } from "../../externals/server/air-travel";
import { orderStore } from "../../externals/store";

export function useHomePage() {
    const [fromAirportId, setFromAirportId] = useState("");
    const [toAirportId, setToAirportId] = useState("");
    const [airportDistance, setAirportDistance] = useState(0);

    function handlePayment() {
        if (!(fromAirportId && toAirportId)) return;

        placeTravelOrder(fromAirportId, toAirportId).then((orderDetails) => {
            orderStore.save(orderDetails);
            window.open(orderDetails.payment_url, "_self");
        });
    }

    useEffect(() => {
        if (!(fromAirportId && toAirportId)) return;

        calculateDistanceBtw(fromAirportId, toAirportId)
            .then(setAirportDistance)
            .catch(() => alert("Error obtaining distance"));
    }, [fromAirportId, toAirportId]);

    return {
        setFromAirportId,
        setToAirportId,
        handlePayment,
        airportDistance: airportDistance ? airportDistance + " km" : "_",
    };
}
