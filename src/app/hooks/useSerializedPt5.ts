import { serializePt5 } from "../../formats/pt5/serializer.ts";
import { useConvertedPt5 } from "./useConvertedPt5.ts";

export const useSerializedPt5 = () => {
    const converted = useConvertedPt5();
    return converted ? [...serializePt5(converted)] : [];
};
