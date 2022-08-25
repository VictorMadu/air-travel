import express from "express";
import { airportService } from "../services";
import { send200, send400, sendServerError } from "./res-send-fns";

const router = express.Router();

// TODO: Turn to class and decouple the dependencies for easy testing and maintainence
router.get("/", (req, res) => {
    const query = <GetAirportsQuery>req.query;
    console.log("query", query);
    const countryOrLocationSearch = query.country || req.socket.remoteAddress;
    if (!countryOrLocationSearch)
        return send400(
            res,
            "Please make your ip address available or at least provide your country"
        );

    const offset = +(<any>query.offset) || 0;
    const batch = +(<any>query.batch) || 30;

    airportService
        .getAirports({
            countryOrLocationSearch,
            offset,
            batch,
        })
        .then((airports) => {
            send200(res, { airports }, { offset: offset, batch: airports.length });
        })
        .catch((err) => {
            sendServerError(res, err);
        });
});

router.get("/calculate-distance", (req, res) => {
    const query = <CalculateDistanceQuery>req.query;

    const fromAirportUUID = query.from_airport;
    const toAirportUUID = query.to_airport;

    if (fromAirportUUID == null || toAirportUUID == null)
        return sendServerError(res, "Please provide from_airport and to_airport in query");

    airportService
        .getDistanceBtw(fromAirportUUID, toAirportUUID)
        .then((distance) => {
            send200(res, { distance });
        })
        .catch((err) => {
            sendServerError(res, err);
        });
});

router.post("/place-order", (req, res) => {
    const body: Partial<PlaceOrderBody> = req.body;
    const fromAirportUUID = body.from_airport;
    const toAirportUUID = body.to_airport;

    if (!(fromAirportUUID && toAirportUUID))
        return sendServerError(res, "Please provide from_airport and to_airport in body");

    airportService
        .placeOrder(fromAirportUUID, toAirportUUID)
        .then((orderDetail) => {
            if (orderDetail)
                return send200(res, <any>{
                    order_detail: orderDetail,
                });
            return send400(res, "Payment failed");
        })
        .catch((err) => {
            sendServerError(res, err);
        });
});

// TODO: Implement validations for all incoming data in routes
router.get("/get-order-detail", (req, res) => {
    const query = <Partial<GetOrderDetailsQuery>>req.query;
    const id = query.id?.toString();

    if (!id) return sendServerError(res, "Please provide id in query");
    airportService
        .getOrdersDetailsBy(id)
        .then((orderDetail) => {
            if (orderDetail) return send200(res, <any>{ order_detail: orderDetail }); // TODO: Resolve this any issue
            return send400(res, "Failed");
        })
        .catch((err) => {
            sendServerError(res, err);
        });
});

router.post("/update-payment-status", (req, res) => {
    const body: Partial<UpdatePaymentStatusBody> = req.body;
    const id = body.id?.toString();

    console.log("body", body);

    if (!id) return send400(res, "Please provide id in body");
    airportService
        .updatePaymentStatus(id)
        .then(() => {
            return send200(res);
        })
        .catch((err) => {
            sendServerError(res, err);
        });
});

interface GetAirportsQuery {
    country?: string;
    offset?: string;
    batch?: string;
}

interface CalculateDistanceQuery {
    from_airport?: string;
    to_airport?: string;
}

interface GetOrderDetailsQuery {
    id: string;
}

// Good from here
interface PlaceOrderBody {
    from_airport: string;
    to_airport: string;
}

interface UpdatePaymentStatusBody {
    id: string;
}

export default router;
