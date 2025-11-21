import { Accelerometer } from "expo-sensors";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useEffect, useState } from "react";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const NET_WIDTH = 100;
const NET_HEIGHT = 60;
const BALL_SIZE = 50;

export default function App() {
  const [netX, setNetX] = useState((SCREEN_WIDTH - NET_WIDTH) / 2);
  const [balls, setBalls] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [ballSpawner, setBallSpawner] = useState(null);
  const [fallingLoop, setFallingLoop] = useState(null);

  useEffect(() => {
  Accelerometer.setUpdateInterval(100);
  const sub = Accelerometer.addListener(({ x }) => {
  if (gameOver) return;

  setNetX((prev) => {
  let newX = prev - x * 30;

  if (newX < 0) newX = 0;
  if (newX > SCREEN_WIDTH - NET_WIDTH) newX = SCREEN_WIDTH - NET_WIDTH;

  return newX;
    });
    });

    return () => sub && sub.remove();
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
    const randomX = Math.random() * (SCREEN_WIDTH - BALL_SIZE);
    setBalls((prev) => [
        ...prev,{
        id: Math.random().toString(),
        x: randomX,
        y: -10,
        },
      ]);
    }, 1200);

    setBallSpawner(interval);
    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
    setBalls((prev) =>prev.map((b) => ({ ...b, y: b.y + 5 }))
    .filter((b) => {
    const netTop = SCREEN_HEIGHT - NET_HEIGHT - 20;
    const ballBottom = b.y + BALL_SIZE;

            const fullyInside =
              ballBottom >= netTop + NET_HEIGHT * 0.8 &&
              b.x + BALL_SIZE > netX &&
              b.x < netX + NET_WIDTH;

            if (fullyInside) {
              setScore((s) => s + 1);
              return false;
            }
            if (b.y > SCREEN_HEIGHT) {
              setGameOver(true);

              clearInterval(ballSpawner);
              clearInterval(interval);
              setBalls([]);

              return false;
            }

            return true;
          })
      );
    }, 30);

    setFallingLoop(interval);

    return () => clearInterval(interval);
  }, [netX, gameOver]);

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      {balls.map((b) => (
        <View
          key={b.id}
          style={[styles.ball, { left: b.x, top: b.y }]}
        />
      ))}
      <View style={[styles.net, { left: netX }]} />
      {gameOver && (
        <Text style={styles.gameOver}>GAME OVER</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", alignItems: "center" },
  score: { color: "white", fontSize: 24, marginTop: 40 },
  gameOver: {
    position: "absolute",
    top: SCREEN_HEIGHT / 2 - 40,
    color: "red",
    fontSize: 45,
    fontWeight: "bold",
  },
  ball: {
    position: "absolute",
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: 100,
    backgroundColor: "orange",
    borderWidth: 2,
    borderColor: "white",
  },
  net: {
    position: "absolute",
    bottom: 20,
    width: NET_WIDTH,
    height: NET_HEIGHT,
    borderColor: "white",
    borderWidth: 3,
    borderBottomWidth: 8,
    backgroundColor: "transparent",
  },
});
