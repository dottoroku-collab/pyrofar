import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'src/core/theme/app_theme.dart';
import 'src/core/router/app_router.dart';
import 'src/features/auth/providers/auth_provider.dart';
import 'src/features/incident/providers/incident_provider.dart';
import 'src/core/utils/fcm_handler.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase and FCM asynchronously without blocking runApp
  setupFCM().catchError((e) => debugPrint("FCM Setup Error: $e"));
  
  final authProvider = AuthProvider();

  runApp(PyrofarApp(authProvider: authProvider));
}

class PyrofarApp extends StatelessWidget {
  final AuthProvider authProvider;
  
  const PyrofarApp({super.key, required this.authProvider});

  @override
  Widget build(BuildContext context) {
    // Inject the same authProvider instance to the Notifier for GoRouter
    // We already set this up in app_router.dart by having a global notifier
    authProviderNotifier.setAuthProvider(authProvider);

    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: authProvider),
        ChangeNotifierProvider(create: (_) => IncidentProvider()),
      ],
      child: MaterialApp.router(
        title: 'PYROFAR',
        theme: AppTheme.darkTheme,
        routerConfig: appRouter,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
