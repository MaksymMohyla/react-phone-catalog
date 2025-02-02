import "./App.scss";
import { Outlet } from "react-router-dom";
import { debounce } from "lodash";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { setLanguage, setScreenWidth } from "./features/globalSlice";
import { Header, HeaderOrigin } from "./components/PageTopComponents/Header";
import { Menu } from "./components/PageTopComponents/Menu";
import { Footer } from "./components/Footer";
import {
  initDetailedProducts,
  initProducts,
  setCartList,
  setFavoritesList,
  setTotalItemsInCart,
} from "./features/productSlice";
import {
  getProductsFromStorage,
  LocaleStorageKeys,
  saveProductsToStorage,
} from "./app/localeStorage";

export const App = () => {
  const dispatch = useAppDispatch();
  const { favoritesList, cartList } = useAppSelector((st) => st.products);
  const { language, isMenuOpened } = useAppSelector((st) => st.global);

  //#region get items from server
  /* get productList from server. I do this in App because this list
  is needed in several components that are all child of App */
  useEffect(() => {
    dispatch(initProducts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(initDetailedProducts());
  }, [dispatch]);
  //#endregion

  // recalculate screenWidth everytime it changes
  useEffect(() => {
    const handleResize = debounce(() => {
      dispatch(setScreenWidth(window.innerWidth));
    }, 200);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  //#region work with storage
  useEffect(() => {
    if (localStorage.getItem(LocaleStorageKeys.FAVORITES)) {
      dispatch(
        setFavoritesList(getProductsFromStorage(LocaleStorageKeys.FAVORITES))
      );
    }

    if (localStorage.getItem(LocaleStorageKeys.CART)) {
      dispatch(setCartList(getProductsFromStorage(LocaleStorageKeys.CART)));
    }
  }, [dispatch]);

  useEffect(() => {
    saveProductsToStorage(LocaleStorageKeys.FAVORITES, favoritesList);
  }, [favoritesList]);

  useEffect(() => {
    saveProductsToStorage(LocaleStorageKeys.CART, cartList);

    dispatch(
      setTotalItemsInCart(
        cartList.reduce((acc, curr) => {
          return (curr.quantity || 1) + acc;
        }, 0)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartList]);

  useEffect(() => {
    if (localStorage.getItem(LocaleStorageKeys.LANGUAGE)) {
      dispatch(setLanguage(localStorage.getItem(LocaleStorageKeys.LANGUAGE)));
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem(LocaleStorageKeys.LANGUAGE, language);
  }, [language]);
  //#endregion

  useEffect(() => {
    if (isMenuOpened) {
      window.document.documentElement.style.overflowY = "hidden";
    } else {
      window.document.documentElement.style.overflowY = "auto";
    }
  }, [isMenuOpened]);

  return (
    <div className="App">
      <Header origin={HeaderOrigin.ONPAGE} />
      <Menu />
      <div className="outlet-container">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default App;
