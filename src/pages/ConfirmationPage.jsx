import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export const ConfirmationPage = () => {
    const location = useLocation();
    const selectedMenu = location.state?.selectedMenu || [];
    const total = location.state?.total || 0;
    const fullName = location.state?.fullName || "";

    return (
        <div className="container min-h-screen overflow-x-hidden pt-8 pb-16">
            <h1 className="text-left text-sm text-agro-color font-semibold mb-1">CONFRIMATION</h1>
            <h2 className="text-left text-2xl font-bold mb-4">ORDER DETAIL</h2>

            <div className="border p-4 text-sm text-left rounded-xl bg-gray-50 mb-10">
                <div className="grid gap-4">

                    <div>
                        <div className="font-bold">Transcation ID</div>
                        <div>123-abc</div>
                    </div>

                    <div>
                        <div className="font-bold">Customer Name</div>
                        <div>{fullName}</div>
                    </div>

                    <div>
                        <div className="font-bold">Status</div>
                        <div>waiting for payment</div>
                    </div>

                </div>
            </div>

            <div className="border p-4 rounded-xl bg-gray-50">
                <div className="space-y-2">
                    {selectedMenu.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div className="text-left">
                                <span>{item.jumlah}x</span>{' '}
                                <span>{item.name}</span>
                            </div>
                            <div className="text-right font-semibold">
                                Rp{item.price.toFixed(3)}
                            </div>
                        </div>
                    ))}
                </div>


                <div className="flex justify-between mt-4 border-t pt-2">
                    <p className="font-semibold">Total</p>
                    <p className="text-green-700 font-semibold">Rp{total.toFixed(3)}</p>
                </div>
            </div>

            <div className="flex mt-10">
                <Link to={"/menu"} className="bg-agro-color rounded-full text-white px-6 py-2">
                    <span>Back</span>
                </Link>
            </div>

        </div>
    );
}