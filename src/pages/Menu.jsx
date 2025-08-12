import { ArrowRight } from "lucide-react";
import MenuCard from "../components/MenuCard";
//import { MenuData } from "../data/MenuData";
import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

function removeSessionStorage() {
  sessionStorage.removeItem("fullName");
  sessionStorage.setItem("jumlah_menu", "");
  sessionStorage.removeItem("isSubmit");
}

export const Menu = () => {
  const [jumlah, setJumlah] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const isFirstLoad = useRef(true);

  const [MenuData, setMenu] = useState([]);

  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menu_makanan"));
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMenu(list);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchMenu();
  }, []);

  //Simpan menu yang sudah dipilih ke local storage agar dapat dipull kembali saat user ingin mengganti menu
  //load menu jika ada value
  useEffect(() => {
    const isSubmit = sessionStorage.getItem("isSubmit");
    const savedMenu = sessionStorage.getItem("jumlah_menu");

    if (isSubmit === "1") {
      removeSessionStorage();
      return;
    }

    if (savedMenu) {
      setJumlah(JSON.parse(savedMenu));
    }
  }, []);

  //save menu setelah load pertama
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    sessionStorage.setItem("jumlah_menu", JSON.stringify(jumlah));
  }, [jumlah, isLoaded]);

  const tambah = (id) => {
    setJumlah(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const kurang = (id) => {
    setJumlah(prev => {
      const temp = { ...prev };
      if (temp[id] > 1) {
        temp[id] -= 1;
      } else {
        delete temp[id];
      }
      return temp;
    });
  };

  if (!isLoaded) {
    return (
      <div className="container min-h-screen flex justify-center items-center">
        <p className="text-lg font-semibold">Loading Menu...</p>
      </div>
    )
  }
  const totalMenu = Object.values(jumlah).reduce((a, b) => a + b, 0);
  const selectedMenu = MenuData.filter(item => jumlah[item.id] > 0).map(item => ({ ...item, jumlah: jumlah[item.id] }));

  return (
    <div className="container min-h-screen overflow-x-hidden pt-8 pb-16">

      <main>
        <h1 className="text-left text-sm text-agro-color font-semibold mb-1">MENU LIST</h1>
        <h2 className="text-left text-2xl font-bold mb-4">Main Dish</h2>
        {/* food items section */}
        <div className="grid grid-cols-2 gap-4 max-h-screen scrollbar-hide overflow-y-scroll mb-4">
          {MenuData
            .filter(item => item.category === "Main Dish")
            .slice() // creates a copy so the original array isn't mutated
            .sort((a, b) => a.name.localeCompare(b.name)) // sort by name descending
            .map((item) => (
              <MenuCard
                key={item.id}
                id={item.id}
                name={item.name}
                cn={item.cn}
                price={item.price}
                image={item.image}
                jumlah={jumlah[item.id] || 0}
                tambah={tambah}
                kurang={kurang}
              />
            ))}
        </div>

        <h2 className="text-left text-2xl font-bold mb-4">Sides</h2>
        {/* food items section */}
        <div className="grid grid-cols-2 gap-4 max-h-screen scrollbar-hide overflow-y-scroll mb-4">
          {MenuData
            .filter(item => item.category === "Sides")
            .slice() // creates a copy so the original array isn't mutated
            .sort((a, b) => a.name.localeCompare(b.name)) // sort by name descending
            .map((item) => (
              <MenuCard
                key={item.id}
                id={item.id}
                name={item.name}
                cn={item.cn}
                price={item.price}
                image={item.image}
                jumlah={jumlah[item.id] || 0}
                tambah={tambah}
                kurang={kurang}
              />
            ))}
        </div>

        <h2 className="text-left text-2xl font-bold mb-4">Drinks</h2>
        {/* food items section */}
        <div className="grid grid-cols-2 gap-4 max-h-screen scrollbar-hide overflow-y-scroll mb-4">
          {MenuData
            .filter(item => item.category === "Drinks")
            .slice() // creates a copy so the original array isn't mutated
            .sort((a, b) => a.name.localeCompare(b.name)) // sort by name descending
            .map((item) => (
              <MenuCard
                key={item.id}
                id={item.id}
                name={item.name}
                cn={item.cn}
                price={item.price}
                image={item.image}
                jumlah={jumlah[item.id] || 0}
                tambah={tambah}
                kurang={kurang}
              />
            ))}
        </div>

        {/* cart button */}
        {totalMenu > 0 ? (<Link to={`/checkout?tableId=${tableId}`} state={{ selectedMenu }} className="fixed bottom-2 left-1/2 -translate-x-1/2 w-1/2 bg-agro-color flex justify-center rounded-full button-hover">
          <div className="flex space-x-2 items-center p-2 rounded-md">
            <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-white">
              {totalMenu < 10 ? totalMenu : "9+"}
            </span>
            <span className="text-white">See Cart</span>
            <ArrowRight className="text-white" />
          </div>
        </Link>) : ("")}

      </main>

    </div>
  );
};