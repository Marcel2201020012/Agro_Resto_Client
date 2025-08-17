import { ArrowRight } from "lucide-react";
import MenuCard from "../components/MenuCard";
import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

import { Navbar } from "../components/Navbar";

function MenuCategory({ category, title, MenuData, jumlah, tambah, kurang }) {
  const filteredItems = MenuData
    .filter(item => item.category === category)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <h2 className="text-left text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4 max-h-screen scrollbar-hide overflow-y-scroll mb-4">
        {filteredItems.map(item => (
          <MenuCard
            key={item.id}
            id={item.id}
            name={item.name}
            cn={item.cn}
            price={item.price}
            stocks={item.stocks}
            image={item.image}
            jumlah={jumlah[item.id] || 0}
            tambah={tambah}
            kurang={kurang}
          />
        ))}
      </div>
    </>
  );
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
        let list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        list = list.map(item => ({
          ...item,
          stocks: item.stocks - (jumlah[item.id] || 0)
        }));

        setMenu(list);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchMenu();
  }, [jumlah]);

  //Simpan menu yang sudah dipilih ke local storage agar dapat dipull kembali saat user ingin mengganti menu
  //load menu jika ada value
  useEffect(() => {
    const savedMenu = sessionStorage.getItem("jumlah_menu");

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
    setMenu(prevMenu =>
      prevMenu.map(item =>
        item.id === id && item.stocks > 0
          ? { ...item, stocks: item.stocks - 1 }
          : item
      )
    );
    setJumlah(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };


  const kurang = (id) => {
    setMenu(prevMenu =>
      prevMenu.map(item =>
        item.id === id
          ? { ...item, stocks: item.stocks + 1 }
          : item
      )
    );

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
    <div className="min-h-screen overflow-x-hidden pb-16">
      <Navbar />

      <main className="container mt-16">
        <section id="#">
          <MenuCategory
            category="Main Dish"
            title="Main Dish"
            MenuData={MenuData}
            jumlah={jumlah}
            tambah={tambah}
            kurang={kurang}
          />
        </section>

        <section id="Sides">
          <br />
        </section>
        <br />
        <br />

        <MenuCategory
          category="Sides"
          title="Sides"
          MenuData={MenuData}
          jumlah={jumlah}
          tambah={tambah}
          kurang={kurang}
        />

        <section id="Coffee">
          <br />
        </section>
        <br />
        <br />

        <MenuCategory
          category="Coffee"
          title="Coffee"
          MenuData={MenuData}
          jumlah={jumlah}
          tambah={tambah}
          kurang={kurang}
        />

        <section id="Non-Coffee">
          <br />
        </section>
        <br />
        <br />

        <MenuCategory
          category="Non-Coffee"
          title="Non-Coffee"
          MenuData={MenuData}
          jumlah={jumlah}
          tambah={tambah}
          kurang={kurang}
        />

        <section id="Juice">
          <br />
        </section>
        <br />
        <br />

        <MenuCategory
          category="Juice"
          title="Juice"
          MenuData={MenuData}
          jumlah={jumlah}
          tambah={tambah}
          kurang={kurang}
        />

        <section id="Tea">
          <br />
        </section>
        <br />
        <br />

        <MenuCategory
          category="Tea"
          title="Tea"
          MenuData={MenuData}
          jumlah={jumlah}
          tambah={tambah}
          kurang={kurang}
        />

        <section id="Soft Drink">
          <br />
        </section>
        <br />
        <br />
        <MenuCategory
          category="Soft Drink"
          title="Soft Drink"
          MenuData={MenuData}
          jumlah={jumlah}
          tambah={tambah}
          kurang={kurang}
        />

        <section id="Beer">
          <br />
        </section>
        <br />
        <br />

        <MenuCategory
          category="Beer"
          title="Beer"
          MenuData={MenuData}
          jumlah={jumlah}
          tambah={tambah}
          kurang={kurang}
        />

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