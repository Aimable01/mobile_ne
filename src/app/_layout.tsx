import { Drawer } from "expo-router/drawer";
import DrawerContent from "../components/DrawerContent";

export default function RootLayout() {
  return (
    <Drawer
      screenOptions={{ headerShown: false }}
      drawerContent={() => <DrawerContent />}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="word-details" />
    </Drawer>
  );
}
