import 'package:flutter_test/flutter_test.dart';
import 'package:sim_armada_mobile/main.dart';
import 'package:sim_armada_mobile/src/features/auth/providers/auth_provider.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    final authProvider = AuthProvider();
    await tester.pumpWidget(PyrofarApp(authProvider: authProvider));
    expect(find.byType(PyrofarApp), findsOneWidget);
  });
}
