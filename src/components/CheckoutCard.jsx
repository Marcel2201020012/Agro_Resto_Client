const CheckoutCard = ({id, image, name, jumlah, price}) => {
    return (
        <div className="bg-white p-3 rounded-xl shadow-md">
            <img src={image} alt={name} className="rounded-full w-24 h-24 mx-auto object-cover" />
            <h3 className="text-sm font-semibold mt-2">{name} - {jumlah} Item</h3>
            <p className="text-green-700 font-semibold text-sm">Rp{price}</p>
        </div>
    )
}

export default CheckoutCard;