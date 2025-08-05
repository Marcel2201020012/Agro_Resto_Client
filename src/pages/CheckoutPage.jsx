import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import CheckoutCard from '../components/CheckoutCard';
import { Link } from 'react-router-dom';

export const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedMenu = location.state?.selectedMenu || [];

    const total = selectedMenu.reduce((acc, item) => acc + item.price * item.jumlah, 0);

    const [showModal, setShowModal] = useState(false);
    const [pendingData, setPendingData] = useState(null);

    const [fullName, setFullName] = useState('');
    const [tableId, setTableId] = useState('');
    const [fullNameError, setFullNameError] = useState("");

    const isFirstLoad = useRef(true);

    useEffect(() => {
        const userName = sessionStorage.getItem("fullName");
        if (userName) {
            setFullName(JSON.parse(userName));
        }
    }, []);

    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        sessionStorage.setItem("fullName", JSON.stringify(fullName));
    }, [fullName]);

    const validateFullName = () => {
        if (fullName.trim().length < 3) {
            setFullNameError("Full name must be at least 3 characters long.");
            return false;
        }
        setFullNameError("");
        return true;
    };

    const handleNextClick = (e) => {
        e.preventDefault();

        if (!validateFullName()) return;

        setPendingData({ fullName, selectedMenu, total });

        setShowModal(true);
    };

  const handleConfirm = () => {
    setShowModal(false);
    if (pendingData) {
        navigate("/confirm", {
            replace: true,
            state: pendingData
        });
    }
};


    const handleCancel = () => {
        setShowModal(false);
        setPendingData(null);
    };

    return (
        <div className="container min-h-screen overflow-x-hidden pt-8 pb-16">
            <h1 className="text-left text-sm text-agro-color font-semibold mb-1">CHECKOUT</h1>
            <h2 className="text-left text-2xl font-bold mb-4">Order Detail</h2>

            <div className="border p-4 rounded-xl bg-gray-50">
                <div className="grid grid-cols-2 gap-4 h-48 overflow-x-hidden scrollbar-hide overflow-y-scroll">
                    {selectedMenu.map((item) => (
                        <CheckoutCard
                            key={item.id}
                            id={item.id}
                            image={item.image}
                            name={item.name}
                            jumlah={item.jumlah}
                            price={item.price}
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-4 border-t pt-2">
                    <p className="font-semibold">Total Order</p>
                    <p className="text-green-700 font-semibold">Rp{total}</p>
                </div>
            </div>

            {/* Buyer Details */}
            <h2 className="text-2xl font-bold mt-10 mb-4">Customer Detail</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-left block font-semibold mb-1">Full Name</label>
                    <textarea
                        className={`w-full border p-2 rounded ${fullNameError ? "border-red-500" : "border-gray-300"}`}
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        onBlur={validateFullName}  // validate on blur too
                    />
                    {fullNameError && (
                        <p className="text-red-500 mt-1 text-sm">{fullNameError}</p>
                    )}
                </div>
                <div>
                    <label className="text-left block font-semibold mb-1">Table ID</label>
                    <textarea
                        className="w-full border p-2 rounded"
                        value={tableId}
                        onChange={e => setTableId(e.target.value)}
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-10">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-agro-color text-white px-6 py-2 rounded-full"
                >
                    Back
                </button>
                <button
                    onClick={handleNextClick}
                    className="bg-agro-color rounded-full text-white px-6 py-2 flex"
                >
                    Next
                </button>
            </div>

            {/* confirmation pop */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center w-1/2">
                        <h2 className="text-lg font-bold mb-4">Attention</h2>
                        <p>Is the entered data correct?</p>
                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                onClick={handleConfirm}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Yes
                            </button>
                            <button
                                onClick={handleCancel}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}