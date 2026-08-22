import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/dashboard/screens/dashboard_cc_screen.dart';
import '../../features/dashboard/screens/dashboard_lapangan_screen.dart';
import '../../features/dashboard/screens/dashboard_pimpinan_screen.dart';

final authProviderNotifier = AuthProviderNotifier();

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  refreshListenable: authProviderNotifier,
  redirect: (context, state) {
    final authProvider = context.read<AuthProvider>();
    final isAuth = authProvider.isAuthenticated;
    final isLoginRoute = state.matchedLocation == '/login';

    if (authProvider.isLoading) {
      return null; // Wait for loading
    }

    if (!isAuth && !isLoginRoute) {
      return '/login';
    }

    if (isAuth && isLoginRoute) {
      // Role-based routing
      final role = authProvider.user?.role;
      if (role == 'pimpinan') {
        return '/dashboard/pimpinan';
      } else if (role == 'operator_cc' || role == 'administrator') {
        return '/dashboard/cc';
      } else if (role == 'operator_lapangan_damkar' || role == 'operator_lapangan_penyelamatan') {
        return '/dashboard/lapangan';
      }
      return '/dashboard/pimpinan'; // Default fallback
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/dashboard/pimpinan',
      builder: (context, state) => const DashboardPimpinanScreen(),
    ),
    GoRoute(
      path: '/dashboard/cc',
      builder: (context, state) => const DashboardCCScreen(),
    ),
    GoRoute(
      path: '/dashboard/lapangan',
      builder: (context, state) => const DashboardLapanganScreen(),
    ),
  ],
);

// Helper to use AuthProvider as a listenable for GoRouter
class AuthProviderNotifier extends ChangeNotifier {
  AuthProviderNotifier();
  
  void setAuthProvider(AuthProvider provider) {
    provider.addListener(() {
      notifyListeners();
    });
  }
}
