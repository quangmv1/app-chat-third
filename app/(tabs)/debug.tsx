import crashlytics from '@react-native-firebase/crashlytics';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DebugScreen() {
  const [userId, setUserId] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [collectionEnabled, setCollectionEnabled] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${message}`, ...prev].slice(0, 20));
  };

  const handleToggleCollection = async (value: boolean) => {
    await crashlytics().setCrashlyticsCollectionEnabled(value);
    setCollectionEnabled(value);
    addLog(`Crashlytics collection ${value ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleSetUserId = async () => {
    if (!userId.trim()) {
      Alert.alert('Error', 'Please enter a User ID');
      return;
    }
    await crashlytics().setUserId(userId.trim());
    addLog(`User ID set: "${userId.trim()}"`);
    Alert.alert('✅ Done', `User ID "${userId.trim()}" sent to Crashlytics`);
  };

  const handleSetAttribute = async () => {
    if (!customKey.trim() || !customValue.trim()) {
      Alert.alert('Error', 'Please enter both key and value');
      return;
    }
    await crashlytics().setAttribute(customKey.trim(), customValue.trim());
    addLog(`Attribute set: "${customKey}" = "${customValue}"`);
    Alert.alert('✅ Done', `Custom attribute sent to Crashlytics`);
  };

  const handleLogMessage = async () => {
    const msg = `Test log message at ${new Date().toISOString()}`;
    await crashlytics().log(msg);
    addLog(`Log sent: "${msg}"`);
    Alert.alert('✅ Done', 'Custom log message sent');
  };

  const handleRecordError = () => {
    const error = new Error('Test non-fatal error from debug screen');
    crashlytics().recordError(error);
    addLog('Non-fatal error recorded ✓');
    Alert.alert('✅ Recorded', 'Non-fatal error sent to Crashlytics.\nCheck Firebase Console → Crashlytics → Non-fatals in ~5 min');
  };

  const handleForceCrash = () => {
    Alert.alert(
      '💥 Force Crash',
      'This will CRASH the app immediately. Check Firebase Console after relaunching.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'CRASH NOW',
          style: 'destructive',
          onPress: () => {
            crashlytics().log('Force crash triggered from debug screen');
            crashlytics().crash();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🔥</Text>
          <Text style={styles.headerTitle}>Crashlytics Debug</Text>
          <Text style={styles.headerSubtitle}>Firebase Test Console</Text>
        </View>

        {/* Collection Toggle */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardLabelGroup}>
              <Text style={styles.cardLabel}>Data Collection</Text>
              <Text style={styles.cardHint}>Enable/disable crash reporting</Text>
            </View>
            <Switch
              value={collectionEnabled}
              onValueChange={handleToggleCollection}
              trackColor={{ false: '#2a2a3a', true: '#6c63ff' }}
              thumbColor={collectionEnabled ? '#fff' : '#888'}
            />
          </View>
        </View>

        {/* Set User ID */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Set User ID</Text>
          <Text style={styles.cardHint}>Attach a user identifier to crash reports</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. user_12345"
              placeholderTextColor="#555"
              value={userId}
              onChangeText={setUserId}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.inlineButton} onPress={handleSetUserId}>
              <Text style={styles.inlineButtonText}>Set</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Attribute */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Custom Attribute</Text>
          <Text style={styles.cardHint}>Add key/value metadata to crash reports</Text>
          <TextInput
            style={[styles.input, { marginBottom: 8 }]}
            placeholder="Key (e.g. screen_name)"
            placeholderTextColor="#555"
            value={customKey}
            onChangeText={setCustomKey}
            autoCapitalize="none"
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Value (e.g. HomeScreen)"
              placeholderTextColor="#555"
              value={customValue}
              onChangeText={setCustomValue}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.inlineButton} onPress={handleSetAttribute}>
              <Text style={styles.inlineButtonText}>Set</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionCard, styles.actionBlue]} onPress={handleLogMessage}>
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionTitle}>Log Message</Text>
            <Text style={styles.actionDesc}>Send a custom log to Crashlytics breadcrumbs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, styles.actionOrange]} onPress={handleRecordError}>
            <Text style={styles.actionIcon}>⚠️</Text>
            <Text style={styles.actionTitle}>Log Non-Fatal</Text>
            <Text style={styles.actionDesc}>Record a non-fatal error (app keeps running)</Text>
          </TouchableOpacity>
        </View>

        {/* Force Crash — full width danger button */}
        <TouchableOpacity style={styles.crashButton} onPress={handleForceCrash}>
          <Text style={styles.crashIcon}>💥</Text>
          <View>
            <Text style={styles.crashTitle}>Force Crash</Text>
            <Text style={styles.crashDesc}>Triggers a real native crash — reopen app to report</Text>
          </View>
        </TouchableOpacity>

        {/* Activity Log */}
        {logs.length > 0 && (
          <View style={styles.logBox}>
            <Text style={styles.logTitle}>Activity Log</Text>
            {logs.map((log, i) => (
              <Text key={i} style={styles.logLine}>{log}</Text>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  scroll: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 8,
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6c63ff',
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#16162a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a40',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabelGroup: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e0e0ff',
    marginBottom: 2,
  },
  cardHint: {
    fontSize: 12,
    color: '#555',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: '#2a2a40',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#e0e0ff',
    fontSize: 14,
  },
  inlineButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  inlineButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  actionBlue: {
    backgroundColor: '#0d1a2e',
    borderColor: '#1a3a5c',
  },
  actionOrange: {
    backgroundColor: '#1a1500',
    borderColor: '#3a2800',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e0e0ff',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 11,
    color: '#555',
    lineHeight: 16,
  },
  crashButton: {
    backgroundColor: '#1a0a0a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#ff3b3b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  crashIcon: {
    fontSize: 32,
  },
  crashTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ff3b3b',
    marginBottom: 4,
  },
  crashDesc: {
    fontSize: 12,
    color: '#664444',
    lineHeight: 17,
  },
  logBox: {
    backgroundColor: '#080810',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  logTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6c63ff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  logLine: {
    fontSize: 11,
    color: '#4a9960',
    fontFamily: 'Courier',
    marginBottom: 4,
    lineHeight: 16,
  },
});
