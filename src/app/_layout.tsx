import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
  return (
    <Drawer screenOptions={{ headerShown: false }}>
      <Drawer.Screen
        name="index"
        options={{
          title: "Search",
        }}
      />
      <Drawer.Screen
        name="word-details"
        options={{
          title: "Word Details",
        }}
      />
    </Drawer>
  );
}
