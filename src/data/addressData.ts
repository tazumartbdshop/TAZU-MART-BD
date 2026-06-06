export interface BangladeshAddressData {
  [division: string]: {
    [district: string]: string[];
  };
}

export const bdAddressData: BangladeshAddressData = {
  'Dhaka': {
    'Dhaka': ['Jatrabari', 'Dhanmondi', 'Gulshan', 'Uttara', 'Mirpur', 'Banani', 'Mohammadpur', 'Motijheel', 'Shahbagh', 'Khilgaon'],
    'Faridpur': ['Faridpur Sadar', 'Boalmari', 'Alfadanga', 'Madhukhali', 'Nagarkanda', 'Saltha', 'Bhanga', 'Sadarpur', 'Charbhadrasan'],
    'Gazipur': ['Gazipur Sadar', 'Kaliakair', 'Kapasia', 'Sreepur', 'Kaliganj'],
    'Gopalganj': ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'],
    'Kishoreganj': ['Kishoreganj Sadar', 'Itna', 'Katiadi', 'Bhairab', 'Tarail', 'Hossainpur', 'Pakundia', 'Kuliarchar', 'Karimgonj', 'Bajitpur', 'Austagram', 'Mithamoin', 'Nikli'],
    'Madaripur': ['Madaripur Sadar', 'Shibchar', 'Kalkini', 'Rajoir'],
    'Manikganj': ['Manikganj Sadar', 'Singair', 'Shibalaya', 'Saturia', 'Harirampur', 'Ghior', 'Daulatpur'],
    'Munshiganj': ['Munshiganj Sadar', 'Gazaria', 'Lohajang', 'Srinagar', 'Sirajdikhan', 'Tongibari'],
    'Narayanganj': ['Narayanganj Sadar', 'Bandar', 'Rupganj', 'Sonargaon', 'Araihazar'],
    'Narsingdi': ['Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur'],
    'Rajbari': ['Rajbari Sadar', 'Goalandaghat', 'Pangsha', 'Baliakandi', 'Kalukhali'],
    'Shariatpur': ['Shariatpur Sadar', 'Damudya', 'Gosairhat', 'Naria', 'Jajira', 'Bhedarganj'],
    'Tangail': ['Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Ghatail', 'Gopalpur', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Dhanbari', 'Kalihati'],
  },
  'Chattogram': {
    'Bandarban': ['Bandarban Sadar', 'Alikadam', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi'],
    'Brahmanbaria': ['Brahmanbaria Sadar', 'Ashuganj', 'Nasirnagar', 'Nabinagar', 'Sarail', 'Shahbazpur', 'Kasba', 'Akhaura', 'Bancharampur', 'Bijoynagar'],
    'Chandpur': ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab Uttar', 'Matlab Dakshin', 'Shahrasti'],
    'Chattogram': ['Panchlaish', 'Kotwali', 'Double Mooring', 'Bakalia', 'Halishahar', 'Pahartali', 'Hathazari', 'Sitakunda', 'Fatikchhari', 'Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip'],
    'Cumilla': ['Cumilla Sadar', 'Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Monohorgonj', 'Meghna', 'Muradnagar', 'Nangalkot', 'Titas'],
    'Cox\'s Bazar': ['Cox\'s Bazar Sadar', 'Chakaria', 'Maheshkhali', 'Teknaf', 'Ukhiya', 'Ramu', 'Pekua', 'Kutubdia'],
    'Feni': ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram', 'Sonagazi', 'Fulgazi'],
    'Khagrachhari': ['Khagrachhari Sadar', 'Dighinala', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh'],
    'Lakshmipur': ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'],
    'Noakhali': ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Sonaimuri', 'Subarnachar', 'Kabirhat'],
    'Rangamati': ['Rangamati Sadar', 'Belaichhari', 'Bagaichhari', 'Barkal', 'Jurachhari', 'Rajasthali', 'Kaptai', 'Langadu', 'Nannerchar', 'Kawkhali'],
  },
  'Sylhet': {
    'Sylhet': ['Sylhet Sadar', 'Beanibazar', 'Bishwanath', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Balaganj', 'Companiganj', 'Jaintiapur', 'Kanaighat', 'South Surma', 'Zakiganj'],
    'Moulvibazar': ['Moulvibazar Sadar', 'Barlekha', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal', 'Juri'],
    'Habiganj': ['Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj'],
    'Sunamganj': ['Sunamganj Sadar', 'Bishwamvapur', 'Chhatak', 'Derai', 'Dharampasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Tahirpur', 'Dakshin Sunamganj'],
  },
  'Rajshahi': {
    'Rajshahi': ['Boalia', 'Motihar', 'Rajpara', 'Shah Makhdum', 'Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore'],
    'Bogura': ['Bogura Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sahajanpur', 'Sariakandi', 'Sherpur', 'Shibganj', 'Sonatala'],
    'Joypurhat': ['Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi'],
    'Naogaon': ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mahadevpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'],
    'Natore': ['Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Singra', 'Naldanga'],
    'Chapainawabganj': ['Chapainawabganj Sadar', 'Gomastapur', 'Nachole', 'Bholahat', 'Shibganj'],
    'Pabna': ['Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Ishwardi', 'Faridpur', 'Santhia', 'Sujanagar'],
    'Sirajganj': ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara'],
  },
  'Khulna': {
    'Khulna': ['Khulna Sadar', 'Daulatpur', 'Khalishpur', 'Khan Jahan Ali', 'Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada'],
    'Bagerhat': ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'],
    'Chuadanga': ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jiban Nagar'],
    'Jashore': ['Jashore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha'],
    'Jhenaidah': ['Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'],
    'Kushtia': ['Kushtia Sadar', 'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Mirpur'],
    'Magura': ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'],
    'Meherpur': ['Meherpur Sadar', 'Gangni', 'Mujibnagar'],
    'Narail': ['Narail Sadar', 'Lohagara', 'Kalia'],
    'Satkhira': ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'],
  },
  'Barishal': {
    'Barishal': ['Barishal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gournadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'],
    'Barguna': ['Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali'],
    'Bhola': ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'],
    'Jhalokathi': ['Jhalokathi Sadar', 'Kathalia', 'Nalchity', 'Rajapur'],
    'Patuakhali': ['Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Rangabali', 'Dumki'],
    'Pirojpur': ['Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad', 'Zianagar'],
  },
  'Rangpur': {
    'Rangpur': ['Rangpur Sadar', 'Badarganj', 'Gangachara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj'],
    'Dinajpur': ['Dinajpur Sadar', 'Biral', 'Birganj', 'Bochaganj', 'Chirirbandar', 'Phulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur', 'Birol'],
    'Gaibandha': ['Gaibandha Sadar', 'Phulchhari', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj'],
    'Kurigram': ['Kurigram Sadar', 'Bhurungamari', 'Chilmari', 'Phulbari', 'Rajarhat', 'Rajibpur', 'Roumari', 'Nageshwari', 'Ulipur'],
    'Lalmonirhat': ['Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram'],
    'Nilphamari': ['Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Saidpur'],
    'Panchagarh': ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia'],
    'Thakurgaon': ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail'],
  },
  'Mymensingh': {
    'Mymensingh': ['Mymensingh Sadar', 'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Nandail', 'Phulpur', 'Trishal', 'Tara Khanda'],
    'Jamalpur': ['Jamalpur Sadar', 'Bakshiganj', 'Dewanganj', 'Islampur', 'Madarganj', 'Melandaha', 'Sarishabari'],
    'Netrokona': ['Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Khaliajuri', 'Kalmakanda', 'Kendua', 'Madan', 'Mohanganj', 'Purbadhala'],
    'Sherpur': ['Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi'],
  }
};

export const divisions = Object.keys(bdAddressData);
