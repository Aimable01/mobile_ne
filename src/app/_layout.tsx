import { Drawer } from "expo-router/drawer";
import DrawerContent from "../components/DrawerContent";
import { SearchHistoryProvider } from "../contexts/SearchHistoryContext";

export default function RootLayout() {
  return (
    <SearchHistoryProvider>
      <Drawer
        screenOptions={{ headerShown: false }}
        drawerContent={() => <DrawerContent />}
      >
        <Drawer.Screen name="index" />
        <Drawer.Screen name="word-details" />
      </Drawer>
    </SearchHistoryProvider>
  );
}
