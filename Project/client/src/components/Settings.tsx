import { useNavigate } from "react-router-dom";
import { useVerifyAuth } from "../hooks/useVerifyAuth";

export function Settings() {
    const { profile } = useVerifyAuth();
    const navigate = useNavigate();
    return (
        <div>
            <h1>Settings</h1>
            <h1 className="text-3xl text-blue-800">
                {`Welcome ${profile.name} in the Settings Page!`}
            </h1>
            <button className=" border-2 border-blue-800 p-2 rounded-lg m-5"
                onClick={() => {
                    sessionStorage.removeItem("datiAttore");
                    navigate(-1)
                }}
            >
                Go Back to first page
            </button>
        </div>
    );
}