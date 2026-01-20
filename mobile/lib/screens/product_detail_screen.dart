import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/product.dart';
import '../models/product_faq.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  List<ProductFAQ> _faqs = [];
  String? _whatsappNumber;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    await _fetchFaqs();
    await _fetchAppSettings();
    setState(() => _isLoading = false);
  }

  Future<void> _fetchFaqs() async {
    try {
      final faqsSnapshot = await FirebaseFirestore.instance
          .collection('products')
          .doc(widget.product.id)
          .collection('faqs')
          .where('isActive', isEqualTo: true)
          .orderBy('displayOrder')
          .get();
      setState(() {
        _faqs = faqsSnapshot.docs.map((doc) => ProductFAQ.fromFirestore(doc)).toList();
      });
    } catch (e) {
      print('Error fetching FAQs: $e');
    }
  }

  Future<void> _fetchAppSettings() async {
    try {
      final settingsDoc = await FirebaseFirestore.instance.collection('app_settings').doc('global').get();
      if (settingsDoc.exists) {
        setState(() {
          _whatsappNumber = settingsDoc.data()?['whatsappNumber'];
        });
      }
    } catch (e) {
      print('Error fetching app settings: $e');
    }
  }

  void _launchWhatsApp(BuildContext context) async {
    if (_whatsappNumber == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('WhatsApp number is not configured.')),
      );
      return;
    }
    final message = widget.product.whatsappTemplate
        .replaceAll('{productName}', widget.product.name)
        .replaceAll('{productId}', widget.product.id);
    final Uri whatsappUri = Uri.parse('https://wa.me/$_whatsappNumber?text=${Uri.encodeComponent(message)}');
    
    if (!await launchUrl(whatsappUri)) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not launch WhatsApp.')),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.product.name),
        backgroundColor: const Color(0xFF1F1F1F),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.product.imageUrls.isNotEmpty)
              SizedBox(
                height: 300,
                child: PageView.builder(
                  itemCount: widget.product.imageUrls.length,
                  itemBuilder: (context, index) {
                    return Image.network(
                      widget.product.imageUrls[index],
                      fit: BoxFit.cover,
                      loadingBuilder: (context, child, progress) => progress == null ? child : const Center(child: CircularProgressIndicator()),
                    );
                  },
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.product.name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 8),
                  Text(widget.product.category, style: TextStyle(fontSize: 16, color: Colors.grey[400])),
                  const SizedBox(height: 16),
                  const Divider(color: Colors.grey),
                  const SizedBox(height: 16),
                  Text(widget.product.description, style: TextStyle(fontSize: 16, color: Colors.grey[300])),
                  const SizedBox(height: 24),
                  if (_isLoading)
                    const Center(child: CircularProgressIndicator())
                  else if (_faqs.isNotEmpty)
                    ..._buildFaqSection(),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ElevatedButton(
          onPressed: () => _launchWhatsApp(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF25D366),
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
          child: const Text('Buy on WhatsApp', style: TextStyle(fontSize: 18, color: Colors.white)),
        ),
      ),
    );
  }

  List<Widget> _buildFaqSection() {
    return [
      const Text('Frequently Asked Questions', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
      const SizedBox(height: 16),
      ..._faqs.map((faq) => ExpansionTile(
        title: Text(faq.question, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text(faq.answer, style: TextStyle(color: Colors.grey[300])),
          ),
        ],
      )),
    ];
  }
}
