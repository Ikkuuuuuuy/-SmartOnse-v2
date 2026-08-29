export interface NearbyPlace {
    name: string;
    distance: string;
}

export interface NearbyCategory {
    id: string;
    title: string;
    icon: string;
    places: NearbyPlace[];
}

export const nearbyServiceCategories: NearbyCategory[] = [
    {
        id: 'healthcare',
        title: 'Healthcare',
        icon: '🏥',
        places: [
            { name: 'Caritas Manila Health & Wellness Clinic', distance: '0.1 km' },
            { name: 'The Medical City Clinic', distance: '0.5 km' },
            { name: 'Health Center San Juan', distance: '0.6 km' },
            { name: 'St. Martin De Porres Charity Hospital', distance: '0.8 km' },
            { name: 'Cardinal Santos Medical Center', distance: '1.2 km' },
        ],
    },
    {
        id: 'education',
        title: 'Education',
        icon: '🎓',
        places: [
            { name: 'San Juan City Academic Senior High School', distance: '0.1 km' },
            { name: 'O.B. Pagsasarili Preschool', distance: '0.3 km' },
            { name: 'Kids World Integrated School', distance: '0.4 km' },
            { name: 'San Juan Elementary School', distance: '0.5 km' },
            { name: 'Polytechnic University of the Philippines', distance: '1.0 km' },
        ],
    },
    {
        id: 'government',
        title: 'Government',
        icon: '🏛️',
        places: [
            { name: 'Bahay Pamahalaan ng Barangay Isabelita', distance: '0.1 km' },
            { name: 'San Juan City Police Station', distance: '0.3 km' },
            { name: 'San Juan City Hall', distance: '0.8 km' },
            { name: 'Bureau of Fire Protection – San Juan', distance: '0.9 km' },
            { name: 'San Juan Post Office', distance: '1.1 km' },
        ],
    },
    {
        id: 'emergency',
        title: 'Emergency / Community',
        icon: '🚨',
        places: [
            { name: 'DigiParc', distance: '0.3 km' },
            { name: 'Barangay Onse Multi-Purpose Hall', distance: '0.1 km' },
            { name: 'San Juan Covered Court', distance: '0.6 km' },
            { name: 'Barangay 600 Multi-Purpose Building', distance: '1.4 km' },
            { name: 'San Juan Evacuation Center', distance: '1.5 km' },
        ],
    },
    {
        id: 'transport',
        title: 'Transport',
        icon: '🚌',
        places: [
            { name: 'Kalentong – Starmall', distance: '1.1 km' },
            { name: 'J.P. Rizal Jeepney Terminal', distance: '0.4 km' },
            { name: 'Greenhills Transport Hub', distance: '1.8 km' },
            { name: 'Kalahi Banca Ferry Terminal', distance: '2.5 km' },
            { name: 'Shaw Boulevard MRT Station', distance: '2.8 km' },
        ],
    },
    {
        id: 'commerce',
        title: 'Commerce',
        icon: '🏦',
        places: [
            { name: 'Landbank', distance: '0.1 km' },
            { name: 'BDO', distance: '0.3 km' },
            { name: 'BPI', distance: '0.3 km' },
            { name: 'Security Bank', distance: '0.4 km' },
            { name: 'Metrobank', distance: '0.5 km' },
        ],
    },
];

export const barangayMap = {
    name: 'Onse',
    subtitle: 'Onse, San Juan City, Metro Manila',
    address: '3 J V Panganiban, Barangay Onse, San Juan City, Metro Manila 1500',
    embedUrl: 'https://maps.google.com/maps?q=Onse,+San+Juan+City,+Metro+Manila&hl=en&z=16&output=embed',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=3+J+V+Panganiban,+Barangay+Onse,+San+Juan+City,+Metro+Manila+1500',
};
