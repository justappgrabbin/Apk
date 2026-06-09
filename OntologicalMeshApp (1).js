// App.js — Ontological Mesh Node v1.0
// Self-bootstrapping mesh node with ontological addressing
// Compatible with Expo Snack (snack.expo.dev)

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════
// ONTOLOGICAL ADDRESS ENGINE
// Birthday + Time + Place → 5D Address → Node ID
// ═══════════════════════════════════════════════════════════

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

function generateOntologicalAddress(birthData) {
  const { date, time, place } = birthData;

  // Parse date: YYYY-MM-DD
  const [year, month, day] = date.split('-').map(Number);

  // Parse time: HH:MM
  const [hour, minute] = time.split(':').map(Number);

  // Parse place: "City, Country" or lat,lng
  let latitude = 40.7128, longitude = -74.0060; // Default NYC
  if (place.includes(',')) {
    const parts = place.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      latitude = parts[0];
      longitude = parts[1];
    }
  }

  // 5D Address Components (from your JUT theory)
  // Dimension 1: Movement (Energy/Monopole) — Year mod 64
  const yearGate = ((year % 64) || 64);

  // Dimension 2: Evolution (Gravity/Personality) — Month mod 6
  const monthLine = ((month % 6) || 6);

  // Dimension 3: Being (Matter/Atom) — Day mod 6
  const dayColor = ((day % 6) || 6);

  // Dimension 4: Design (Structure) — Hour mod 6
  const hourTone = ((hour % 6) || 6);

  // Dimension 5: Space (Form) — Minute mod 5
  const minuteBase = ((minute % 5) || 5);

  // Additional: Degree from hour (0-29° of sign)
  const degree = (hour * 60 + minute) % 30;

  // Minute of degree
  const minuteOfDegree = minute % 60;

  // Second
  const second = 0; // Would need seconds from birth time

  // Zodiac sign from month
  const signs = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
                 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'];
  const zodiac = signs[month - 1] || 'Aries';

  // House from hour (simplified)
  const house = ((hour % 12) || 12);

  // Planet distribution (13 planets across 5 dimensions)
  const planets = [
    { name: 'Sun', dimension: 1, gate: yearGate },
    { name: 'Moon', dimension: 2, line: monthLine },
    { name: 'Earth', dimension: 3, color: dayColor },
    { name: 'Mercury', dimension: 4, tone: hourTone },
    { name: 'Venus', dimension: 5, base: minuteBase },
    { name: 'Mars', dimension: 1, gate: ((yearGate + 1) % 64 || 64) },
    { name: 'Jupiter', dimension: 2, line: ((monthLine + 1) % 6 || 6) },
    { name: 'Saturn', dimension: 3, color: ((dayColor + 1) % 6 || 6) },
    { name: 'Uranus', dimension: 4, tone: ((hourTone + 1) % 6 || 6) },
    { name: 'Neptune', dimension: 5, base: ((minuteBase + 1) % 5 || 5) },
    { name: 'Pluto', dimension: 1, gate: ((yearGate + 2) % 64 || 64) },
    { name: 'North Node', dimension: 3, color: ((dayColor + 2) % 6 || 6) },
    { name: 'South Node', dimension: 5, base: ((minuteBase + 2) % 5 || 5) },
  ];

  // Generate deterministic node ID
  const seedString = `${year}-${month}-${day}-${hour}-${minute}-${latitude}-${longitude}`;
  const nodeId = hashString(seedString);

  // Human readable address
  const humanReadable = `${yearGate}.${monthLine}.${dayColor}.${hourTone}.${minuteBase}`;

  // Full coordinate string
  const coordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

  return {
    nodeId,
    humanReadable,
    coordinates,
    latitude,
    longitude,

    // 5D breakdown
    dimension1: { name: 'Movement', value: yearGate, label: 'Gate' },
    dimension2: { name: 'Evolution', value: monthLine, label: 'Line' },
    dimension3: { name: 'Being', value: dayColor, label: 'Color' },
    dimension4: { name: 'Design', value: hourTone, label: 'Tone' },
    dimension5: { name: 'Space', value: minuteBase, label: 'Base' },

    // Astro
    degree,
    minuteOfDegree,
    second,
    zodiac,
    house,

    // Planets
    planets,

    // Raw
    birthTimestamp: new Date(year, month - 1, day, hour, minute).getTime(),
  };
}

// ═══════════════════════════════════════════════════════════
// SIMULATED RADIO LAYER
// (Replaces with real WiFi Direct / BLE when ejected)
// ═══════════════════════════════════════════════════════════

class SimulatedRadio {
  constructor() {
    this.peers = [];
    this.listeners = [];
    this.isScanning = false;
    this.myNodeId = null;
  }

  start(nodeId) {
    this.myNodeId = nodeId;
    console.log(`[RADIO] Started with node ${nodeId.slice(0, 8)}...`);
    return Promise.resolve();
  }

  discoverPeers(timeout = 30000) {
    this.isScanning = true;

    return new Promise((resolve) => {
      // Simulate discovering peers over time
      const discoveredPeers = [];

      // Simulate 1-3 peers appearing
      const peerCount = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < peerCount; i++) {
        setTimeout(() => {
          const peer = {
            nodeId: hashString(`peer-${i}-${Date.now()}`),
            signalStrength: Math.floor(Math.random() * 100),
            ontologicalAddress: `${Math.floor(Math.random() * 64) + 1}.${Math.floor(Math.random() * 6) + 1}.${Math.floor(Math.random() * 6) + 1}.${Math.floor(Math.random() * 6) + 1}.${Math.floor(Math.random() * 5) + 1}`,
            lastSeen: Date.now(),
          };
          discoveredPeers.push(peer);
          this.listeners.forEach(cb => cb('peerFound', peer));
        }, 2000 + (i * 3000));
      }

      setTimeout(() => {
        this.isScanning = false;
        resolve(discoveredPeers);
      }, timeout);
    });
  }

  broadcast(data) {
    console.log(`[RADIO] Broadcasting: ${data.slice(0, 50)}...`);
    return Promise.resolve();
  }

  addEventListener(callback) {
    this.listeners.push(callback);
  }

  joinMesh(peer, identity) {
    console.log(`[RADIO] Joining mesh via peer ${peer.nodeId.slice(0, 8)}...`);
    return Promise.resolve({ success: true, peers: [peer] });
  }
}

const radio = new SimulatedRadio();

// ═══════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════

const KEYS = {
  IDENTITY: '@ontological_identity',
  FIRST_LAUNCH: '@mesh_first_launch',
  MESSAGES: '@mesh_messages',
  PEERS: '@mesh_peers',
  STATE: '@mesh_state',
};

// ═══════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════

export default function OntologicalMeshApp() {
  const [stage, setStage] = useState('birth'); // birth → sensing → discovery → mesh → ready
  const [birthData, setBirthData] = useState({ date: '', time: '', place: '' });
  const [identity, setIdentity] = useState(null);
  const [peers, setPeers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chapterProgress, setChapterProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    checkExistingIdentity();
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-20), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const checkExistingIdentity = async () => {
    try {
      const stored = await AsyncStorage.getItem(KEYS.IDENTITY);
      if (stored) {
        const id = JSON.parse(stored);
        addLog('Found existing identity');
        setIdentity(id);
        setStage('ready');
        // Don't auto-start mesh in Snack, just show ready state
        loadPeers();
        loadMessages();
      }
    } catch (e) {
      addLog('No existing identity');
    }
  };

  const loadPeers = async () => {
    const stored = await AsyncStorage.getItem(KEYS.PEERS);
    if (stored) setPeers(JSON.parse(stored));
  };

  const loadMessages = async () => {
    const stored = await AsyncStorage.getItem(KEYS.MESSAGES);
    if (stored) setMessages(JSON.parse(stored));
  };

  const generateIdentity = async () => {
    // Validate
    if (!birthData.date || !birthData.time || !birthData.place) {
      Alert.alert('Incomplete', 'Date, time, and place are required');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;

    if (!dateRegex.test(birthData.date)) {
      Alert.alert('Date format', 'Use YYYY-MM-DD (e.g., 1990-03-15)');
      return;
    }
    if (!timeRegex.test(birthData.time)) {
      Alert.alert('Time format', 'Use HH:MM 24-hour (e.g., 14:30)');
      return;
    }

    addLog('Generating ontological address...');

    // Generate
    const address = generateOntologicalAddress(birthData);

    // Store
    await AsyncStorage.setItem(KEYS.IDENTITY, JSON.stringify(address));
    await AsyncStorage.setItem(KEYS.FIRST_LAUNCH, 'true');

    setIdentity(address);
    addLog(`Address generated: ${address.humanReadable}`);

    // Start chapter sequence
    runBootstrapSequence(address);
  };

  const runBootstrapSequence = async (id) => {
    // Chapter 1: Birth (already done — identity created)
    setStage('sensing');
    setChapterProgress(1);
    addLog('Chapter 1: Birth — Identity crystallized');

    await new Promise(r => setTimeout(r, 1500));

    // Chapter 2: Senses
    setChapterProgress(2);
    addLog('Chapter 2: Senses — Radio awakening');
    await radio.start(id.nodeId);

    await new Promise(r => setTimeout(r, 2000));

    // Chapter 3: Discovery
    setStage('discovery');
    setChapterProgress(3);
    addLog('Chapter 3: Discovery — Scanning for nodes');

    const foundPeers = await radio.discoverPeers(15000); // 15s for demo
    setPeers(foundPeers);
    await AsyncStorage.setItem(KEYS.PEERS, JSON.stringify(foundPeers));

    addLog(`Found ${foundPeers.length} peer(s)`);

    await new Promise(r => setTimeout(r, 1000));

    if (foundPeers.length > 0) {
      // Chapter 4: Connection
      setStage('mesh');
      setChapterProgress(4);
      addLog('Chapter 4: Connection — Joining mesh');
      await radio.joinMesh(foundPeers[0], id);

      await new Promise(r => setTimeout(r, 1500));

      // Chapter 5: Memory
      setChapterProgress(5);
      addLog('Chapter 5: Memory — Syncing state');

      // Simulate receiving a welcome message
      const welcomeMsg = {
        id: Date.now(),
        from: foundPeers[0].ontologicalAddress,
        fromNodeId: foundPeers[0].nodeId.slice(0, 8),
        data: 'Welcome to the mesh. Your ontological address is recognized.',
        timestamp: Date.now(),
        type: 'system',
      };

      const newMessages = [welcomeMsg];
      setMessages(newMessages);
      await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(newMessages));

      await new Promise(r => setTimeout(r, 1500));
    }

    // Chapter 6: Awakening
    setStage('ready');
    setChapterProgress(6);
    addLog('Chapter 6: Awakening — Node fully operational');
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now(),
      from: identity.humanReadable,
      fromNodeId: identity.nodeId.slice(0, 8),
      data: newMessage,
      timestamp: Date.now(),
      type: 'user',
    };

    const updated = [...messages, msg];
    setMessages(updated);
    await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    setNewMessage('');

    // Simulate broadcast
    await radio.broadcast(JSON.stringify(msg));
    addLog(`Broadcasted message to ${peers.length} peer(s)`);
  };

  const resetIdentity = async () => {
    Alert.alert(
      'Reset Node',
      'This will erase your ontological address. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(Object.values(KEYS));
            setIdentity(null);
            setPeers([]);
            setMessages([]);
            setStage('birth');
            setChapterProgress(0);
            addLog('Node reset');
          },
        },
      ]
    );
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER: BIRTH STAGE
  // ═══════════════════════════════════════════════════════════

  if (stage === 'birth') {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Ontological Mesh</Text>
          <Text style={styles.subtitle}>Birth your node into the field</Text>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Birth Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#666"
              value={birthData.date}
              onChangeText={(text) => setBirthData({...birthData, date: text})}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Text style={styles.hint}>e.g., 1990-03-15</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Birth Time</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM (24-hour)"
              placeholderTextColor="#666"
              value={birthData.time}
              onChangeText={(text) => setBirthData({...birthData, time: text})}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Text style={styles.hint}>e.g., 14:30</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Birth Place</Text>
            <TextInput
              style={styles.input}
              placeholder="Latitude, Longitude"
              placeholderTextColor="#666"
              value={birthData.place}
              onChangeText={(text) => setBirthData({...birthData, place: text})}
              autoCapitalize="words"
            />
            <Text style={styles.hint}>e.g., 40.7128, -74.0060 or City, Country</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={generateIdentity}>
            <Text style={styles.buttonText}>Generate Ontological Address</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What happens:</Text>
            <Text style={styles.infoText}>• Your birth data becomes a unique 5D address</Text>
            <Text style={styles.infoText}>• 64 gates × 6 lines × 6 colors × 6 tones × 5 bases</Text>
            <Text style={styles.infoText}>• 13 planets distributed across 5 dimensions</Text>
            <Text style={styles.infoText}>• No account needed. No email. No password.</Text>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: BOOTSTRAP STAGES (Sensing, Discovery, Mesh)
  // ═══════════════════════════════════════════════════════════

  if (stage === 'sensing' || stage === 'discovery' || stage === 'mesh') {
    const chapters = [
      'Birth — Identity crystallized',
      'Senses — Radio awakening',
      'Discovery — Scanning for nodes',
      'Connection — Joining mesh',
      'Memory — Syncing state',
      'Awakening — Node operational',
    ];

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bootstrapping...</Text>
          <Text style={styles.subtitle}>Chapter {chapterProgress} of 6</Text>
        </View>

        <View style={styles.chapterList}>
          {chapters.map((ch, i) => (
            <View key={i} style={[
              styles.chapterItem,
              i < chapterProgress && styles.chapterComplete,
              i === chapterProgress - 1 && styles.chapterActive,
            ]}>
              <Text style={[
                styles.chapterText,
                i < chapterProgress && styles.chapterTextComplete,
                i === chapterProgress - 1 && styles.chapterTextActive,
              ]}>
                {i < chapterProgress ? '✓' : i === chapterProgress - 1 ? '◉' : '○'} {ch}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.logBox}>
          <Text style={styles.logTitle}>System Log</Text>
          <ScrollView style={styles.logScroll}>
            {logs.map((log, i) => (
              <Text key={i} style={styles.logLine}>{log}</Text>
            ))}
          </ScrollView>
        </View>

        {peers.length > 0 && (
          <View style={styles.peerPreview}>
            <Text style={styles.peerTitle}>Peers detected: {peers.length}</Text>
            {peers.map((p, i) => (
              <Text key={i} style={styles.peerLine}>
                {p.ontologicalAddress} (signal: {p.signalStrength}%)
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: READY STAGE (Main Interface)
  // ═══════════════════════════════════════════════════════════

  if (stage === 'ready' && identity) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ontological Mesh</Text>
          <Text style={styles.nodeId}>Node: {identity.nodeId.slice(0, 16)}...</Text>
        </View>

        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
          {/* Identity Card */}
          <View style={styles.identityCard}>
            <Text style={styles.cardTitle}>Ontological Address</Text>
            <Text style={styles.addressBig}>{identity.humanReadable}</Text>
            <Text style={styles.coordinates}>{identity.coordinates}</Text>

            <View style={styles.dimensionsRow}>
              <View style={styles.dimBox}>
                <Text style={styles.dimValue}>{identity.dimension1.value}</Text>
                <Text style={styles.dimLabel}>{identity.dimension1.label}</Text>
                <Text style={styles.dimName}>{identity.dimension1.name}</Text>
              </View>
              <View style={styles.dimBox}>
                <Text style={styles.dimValue}>{identity.dimension2.value}</Text>
                <Text style={styles.dimLabel}>{identity.dimension2.label}</Text>
                <Text style={styles.dimName}>{identity.dimension2.name}</Text>
              </View>
              <View style={styles.dimBox}>
                <Text style={styles.dimValue}>{identity.dimension3.value}</Text>
                <Text style={styles.dimLabel}>{identity.dimension3.label}</Text>
                <Text style={styles.dimName}>{identity.dimension3.name}</Text>
              </View>
              <View style={styles.dimBox}>
                <Text style={styles.dimValue}>{identity.dimension4.value}</Text>
                <Text style={styles.dimLabel}>{identity.dimension4.label}</Text>
                <Text style={styles.dimName}>{identity.dimension4.name}</Text>
              </View>
              <View style={styles.dimBox}>
                <Text style={styles.dimValue}>{identity.dimension5.value}</Text>
                <Text style={styles.dimLabel}>{identity.dimension5.label}</Text>
                <Text style={styles.dimName}>{identity.dimension5.name}</Text>
              </View>
            </View>

            <View style={styles.astroRow}>
              <Text style={styles.astroText}>☉ {identity.zodiac}</Text>
              <Text style={styles.astroText}>{identity.degree}°{identity.minuteOfDegree}'</Text>
              <Text style={styles.astroText}>House {identity.house}</Text>
            </View>
          </View>

          {/* Peers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Peers in Field ({peers.length})</Text>
            {peers.length === 0 ? (
              <Text style={styles.emptyText}>No peers detected. You are the seed node.</Text>
            ) : (
              peers.map((p, i) => (
                <View key={i} style={styles.peerCard}>
                  <Text style={styles.peerAddress}>{p.ontologicalAddress}</Text>
                  <Text style={styles.peerMeta}>Signal: {p.signalStrength}% • {p.nodeId.slice(0, 8)}...</Text>
                </View>
              ))
            )}
          </View>

          {/* Messages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Messages</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.messageInput}
                placeholder="Broadcast to mesh..."
                placeholderTextColor="#666"
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Text style={styles.sendButtonText}>→</Text>
              </TouchableOpacity>
            </View>

            {messages.length === 0 ? (
              <Text style={styles.emptyText}>No messages yet.</Text>
            ) : (
              messages.map((msg) => (
                <View key={msg.id} style={[
                  styles.messageCard,
                  msg.type === 'system' && styles.systemMessage,
                ]}>
                  <Text style={styles.messageFrom}>
                    {msg.type === 'system' ? 'SYSTEM' : msg.from} ({msg.fromNodeId})
                  </Text>
                  <Text style={styles.messageData}>{msg.data}</Text>
                  <Text style={styles.messageTime}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Planets */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13 Planets / 5 Dimensions</Text>
            <View style={styles.planetsGrid}>
              {identity.planets.map((p, i) => (
                <View key={i} style={styles.planetBox}>
                  <Text style={styles.planetName}>{p.name}</Text>
                  <Text style={styles.planetDim}>D{p.dimension}</Text>
                  <Text style={styles.planetValue}>
                    {p.gate || p.line || p.color || p.tone || p.base}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Logs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Log</Text>
            <View style={styles.logBoxSmall}>
              <ScrollView>
                {logs.map((log, i) => (
                  <Text key={i} style={styles.logLine}>{log}</Text>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Reset */}
          <TouchableOpacity style={styles.resetButton} onPress={resetIdentity}>
            <Text style={styles.resetText}>Reset Node (Erase Identity)</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  return <View style={styles.container}><Text>Loading...</Text></View>;
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e0e0ff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#8888aa',
    marginTop: 4,
  },
  nodeId: {
    fontSize: 12,
    color: '#666688',
    marginTop: 4,
    fontFamily: 'monospace',
  },

  // Birth form
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#aaaacc',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 14,
    color: '#e0e0ff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  hint: {
    fontSize: 12,
    color: '#666688',
    marginTop: 6,
  },
  button: {
    backgroundColor: '#4a4a8e',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#e0e0ff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#12121e',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4a4a8e',
  },
  infoTitle: {
    color: '#aaaacc',
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: '#8888aa',
    fontSize: 13,
    marginBottom: 4,
  },

  // Bootstrap chapters
  chapterList: {
    padding: 20,
  },
  chapterItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#12121e',
  },
  chapterComplete: {
    backgroundColor: '#1a2e1a',
    borderLeftWidth: 3,
    borderLeftColor: '#4a8e4a',
  },
  chapterActive: {
    backgroundColor: '#1a1a3e',
    borderLeftWidth: 3,
    borderLeftColor: '#4a4a8e',
  },
  chapterText: {
    color: '#666688',
    fontSize: 14,
  },
  chapterTextComplete: {
    color: '#88aa88',
  },
  chapterTextActive: {
    color: '#aaaacc',
    fontWeight: '600',
  },

  // Log box
  logBox: {
    margin: 20,
    padding: 12,
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  logBoxSmall: {
    padding: 12,
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  logTitle: {
    color: '#666688',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  logScroll: {
    maxHeight: 160,
  },
  logLine: {
    color: '#8888aa',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
  },

  // Peer preview
  peerPreview: {
    margin: 20,
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
  },
  peerTitle: {
    color: '#aaaacc',
    fontWeight: '600',
    marginBottom: 8,
  },
  peerLine: {
    color: '#8888aa',
    fontSize: 13,
  },

  // Ready stage
  mainScroll: {
    padding: 20,
  },
  identityCard: {
    backgroundColor: '#12121e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  cardTitle: {
    color: '#666688',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressBig: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e0e0ff',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  coordinates: {
    fontSize: 13,
    color: '#8888aa',
    marginTop: 4,
    marginBottom: 16,
  },
  dimensionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dimBox: {
    alignItems: 'center',
    flex: 1,
  },
  dimValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#aaaacc',
  },
  dimLabel: {
    fontSize: 10,
    color: '#666688',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  dimName: {
    fontSize: 9,
    color: '#444466',
    marginTop: 2,
  },
  astroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    paddingTop: 12,
  },
  astroText: {
    color: '#8888aa',
    fontSize: 13,
  },

  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaaacc',
    marginBottom: 12,
  },
  emptyText: {
    color: '#444466',
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Peers
  peerCard: {
    backgroundColor: '#12121e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  peerAddress: {
    color: '#e0e0ff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  peerMeta: {
    color: '#666688',
    fontSize: 11,
    marginTop: 4,
  },

  // Messages
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    color: '#e0e0ff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2a2a4e',
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#4a4a8e',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
  },
  sendButtonText: {
    color: '#e0e0ff',
    fontSize: 18,
  },
  messageCard: {
    backgroundColor: '#12121e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  systemMessage: {
    borderLeftWidth: 3,
    borderLeftColor: '#4a8e4a',
  },
  messageFrom: {
    color: '#4a4a8e',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  messageData: {
    color: '#e0e0ff',
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    color: '#444466',
    fontSize: 10,
    marginTop: 4,
  },

  // Planets
  planetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  planetBox: {
    width: '30%',
    backgroundColor: '#12121e',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  planetName: {
    color: '#aaaacc',
    fontSize: 11,
    fontWeight: '600',
  },
  planetDim: {
    color: '#666688',
    fontSize: 9,
    marginTop: 2,
  },
  planetValue: {
    color: '#e0e0ff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },

  // Reset
  resetButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  resetText: {
    color: '#8e4a4a',
    fontSize: 13,
  },
});
