import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import { toast } from 'react-toastify';
import {
  FaUserCircle,
  FaEdit,
  FaCheck,
  FaTimes,
  FaCamera,
  FaInbox,
  FaPaperPlane,
  FaTrash
} from 'react-icons/fa';

import ConnectionRequestCard from '../components/ConnectionRequestCard';

const Label = styled.label`
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: 900px;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(4)} auto;
  .glassmorphism;
  animation: fadeIn 0.8s ease-out;
  position: relative;
  overflow: hidden;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const ProfilePictureContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const ProfilePicture = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${({ theme }) => theme.colors.accent};
  box-shadow: 0 0 15px rgba(255, 205, 210, 0.5);
`;

const EditPictureButton = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    transform: scale(1.1);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ProfileName = styled.h2`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ProfileStudent = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const ProfileInfo = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(4)};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const EditableField = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FieldValue = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  min-height: 1.5em;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  
  .remove-tag {
    cursor: pointer;
    font-size: 0.8rem;
    &:hover {
      color: ${({ theme }) => theme.colors.error};
    }
  }
`;

const AddTagInput = styled(Input)`
  width: auto;
  flex-grow: 1;
  margin-bottom: 0;
  max-width: 250px;
`;

const TagInputWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  align-items: center;
  flex-wrap: wrap;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const TabButton = styled(Button)`
  background-color: ${({ theme, active }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, active }) => active ? theme.colors.textPrimary : theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.accent};

  &:hover {
    background-color: ${({ theme, active }) => active ? theme.colors.primary : 'rgba(255, 205, 210, 0.1)'};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const RequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isEditingEducation, setIsEditingEducation] = useState(false);
    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [isEditingGoals, setIsEditingGoals] = useState(false);
    
    // Temporary edit states
    const [tempBio, setTempBio] = useState('');
    const [tempEducation, setTempEducation] = useState({});
    const [tempInterests, setTempInterests] = useState([]);
    const [tempGoals, setTempGoals] = useState([]);
    const [newInterest, setNewInterest] = useState('');
    const [newGoal, setNewGoal] = useState('');

    const [activeTab, setActiveTab] = useState('profile');
    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [uploading, setUploading] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (user) {
            try {
                const res = await api.get(`/users/me`);
                setProfile(res.data);
                setTempBio(res.data.bio || '');
                
                // Set education fields based on student type
                if (res.data.student === 'college') {
                    setTempEducation({
                        college: res.data.college || '',
                        degree: res.data.degree || '',
                        fieldOfStudy: res.data.fieldOfStudy || ''
                    });
                } else {
                    setTempEducation({
                        school: res.data.school || '',
                        grade: res.data.grade || ''
                    });
                }
                
                setTempInterests(res.data.interests || []);
                setTempGoals(res.data.goals || []);
            } catch (error) {
                console.error('Error fetching profile:', error.response?.data?.message || error.message);
                toast.error('Failed to load user profile. It might not exist or be inaccessible.');
            }
        }
    }, [user]);

    const fetchSentRequests = useCallback(async () => {
        if (user && user.student === 'school') {
            try {
                const res = await api.get('/connections/requests/sent');
                setSentRequests(res.data);
            } catch (error) {
                console.error('Error fetching sent requests:', error.response?.data?.message || error.message);
            }
        }
    }, [user]);

    const fetchReceivedRequests = useCallback(async () => {
        if (user && user.student === 'college') {
            try {
                const res = await api.get('/connections/requests/received');
                setReceivedRequests(res.data);
            } catch (error) {
                console.error('Error fetching received requests:', error.response?.data?.message || error.message);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
        fetchSentRequests();
        fetchReceivedRequests();
    }, [fetchProfile, fetchSentRequests, fetchReceivedRequests]);

    const handleBioSave = async () => {
        try {
            await api.put('/users/me', { bio: tempBio });
            setProfile(prev => ({ ...prev, bio: tempBio }));
            setIsEditingBio(false);
            toast.success('Bio updated successfully!');
        } catch (error) {
            console.error('Error updating bio:', error);
            toast.error('Failed to update bio.');
        }
    };

    const handleEducationSave = async () => {
        try {
            await api.put('/users/me', tempEducation);
            setProfile(prev => ({ ...prev, ...tempEducation }));
            setIsEditingEducation(false);
            toast.success('Education details updated successfully!');
        } catch (error) {
            console.error('Error updating education:', error);
            toast.error('Failed to update education details.');
        }
    };

    const handleInterestsSave = async () => {
        try {
            await api.put('/users/me', { interests: tempInterests });
            setProfile(prev => ({ ...prev, interests: tempInterests }));
            setIsEditingInterests(false);
            toast.success('Interests updated successfully!');
        } catch (error) {
            console.error('Error updating interests:', error);
            toast.error('Failed to update interests.');
        }
    };

    const handleGoalsSave = async () => {
        try {
            await api.put('/users/me', { goals: tempGoals });
            setProfile(prev => ({ ...prev, goals: tempGoals }));
            setIsEditingGoals(false);
            toast.success('Goals updated successfully!');
        } catch (error) {
            console.error('Error updating goals:', error);
            toast.error('Failed to update goals.');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploading(true);
        
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);

            const res = await api.put('/users/me/picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            setProfile(prev => ({ ...prev, profileImage: res.data.profileImage }));
            toast.success('Profile picture updated successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    const addInterest = () => {
        if (newInterest.trim() && !tempInterests.includes(newInterest.trim())) {
            setTempInterests([...tempInterests, newInterest.trim()]);
            setNewInterest('');
        }
    };

    const removeInterest = (index) => {
        setTempInterests(tempInterests.filter((_, i) => i !== index));
    };

    const addGoal = () => {
        if (newGoal.trim() && !tempGoals.includes(newGoal.trim())) {
            setTempGoals([...tempGoals, newGoal.trim()]);
            setNewGoal('');
        }
    };

    const removeGoal = (index) => {
        setTempGoals(tempGoals.filter((_, i) => i !== index));
    };

    if (!profile) {
        return (
            <ProfileContainer>
                <p>Loading profile...</p>
            </ProfileContainer>
        );
    }

    return (
        <ProfileContainer>
            <ProfileHeader>
                <ProfilePictureContainer>
                    <ProfilePicture 
                        src={profile.profileImage || 'https://via.placeholder.com/150?text=No+Image'} 
                        alt="Profile" 
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                    />
                    <EditPictureButton onClick={() => document.getElementById('imageInput').click()}>
                        {uploading ? '...' : <FaCamera />}
                    </EditPictureButton>
                    <HiddenFileInput
                        id="imageInput"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                    />
                </ProfilePictureContainer>
                <ProfileName>{profile.name}</ProfileName>
                <ProfileStudent>
                    {profile.student === 'college' ? 'College Student' : 'School Student'}
                </ProfileStudent>
            </ProfileHeader>

            <TabContainer>
                <TabButton 
                    active={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </TabButton>
                {user.student === 'school' && (
                    <TabButton 
                        active={activeTab === 'sent'} 
                        onClick={() => setActiveTab('sent')}
                    >
                        <FaPaperPlane /> Sent Requests
                    </TabButton>
                )}
                {user.student === 'college' && (
                    <TabButton 
                        active={activeTab === 'received'} 
                        onClick={() => setActiveTab('received')}
                    >
                        <FaInbox /> Received Requests
                    </TabButton>
                )}
            </TabContainer>

            {activeTab === 'profile' && (
                <ProfileInfo>
                    {/* Bio Section */}
                    <InfoSection>
                        <SectionTitle>
                            Bio
                            <Button onClick={() => setIsEditingBio(!isEditingBio)}>
                                {isEditingBio ? <FaTimes /> : <FaEdit />}
                            </Button>
                        </SectionTitle>
                        {isEditingBio ? (
                            <EditableField>
                                <textarea
                                    value={tempBio}
                                    onChange={(e) => setTempBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px' }}
                                />
                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                    <Button onClick={handleBioSave}><FaCheck /> Save</Button>
                                    <Button onClick={() => setIsEditingBio(false)}><FaTimes /> Cancel</Button>
                                </div>
                            </EditableField>
                        ) : (
                            <FieldValue>{profile.bio || 'No bio added yet.'}</FieldValue>
                        )}
                    </InfoSection>

                    {/* Education Section */}
                    <InfoSection>
                        <SectionTitle>
                            Education
                            <Button onClick={() => setIsEditingEducation(!isEditingEducation)}>
                                {isEditingEducation ? <FaTimes /> : <FaEdit />}
                            </Button>
                        </SectionTitle>
                        {isEditingEducation ? (
                            <div>
                                {profile.student === 'college' ? (
                                    <>
                                        <EditableField>
                                            <Label>College</Label>
                                            <Input
                                                value={tempEducation.college || ''}
                                                onChange={(e) => setTempEducation({...tempEducation, college: e.target.value})}
                                                placeholder="Enter college name"
                                            />
                                        </EditableField>
                                        <EditableField>
                                            <Label>Degree</Label>
                                            <Input
                                                value={tempEducation.degree || ''}
                                                onChange={(e) => setTempEducation({...tempEducation, degree: e.target.value})}
                                                placeholder="Enter degree"
                                            />
                                        </EditableField>
                                        <EditableField>
                                            <Label>Field of Study</Label>
                                            <Input
                                                value={tempEducation.fieldOfStudy || ''}
                                                onChange={(e) => setTempEducation({...tempEducation, fieldOfStudy: e.target.value})}
                                                placeholder="Enter field of study"
                                            />
                                        </EditableField>
                                    </>
                                ) : (
                                    <>
                                        <EditableField>
                                            <Label>School</Label>
                                            <Input
                                                value={tempEducation.school || ''}
                                                onChange={(e) => setTempEducation({...tempEducation, school: e.target.value})}
                                                placeholder="Enter school name"
                                            />
                                        </EditableField>
                                        <EditableField>
                                            <Label>Grade</Label>
                                            <Input
                                                value={tempEducation.grade || ''}
                                                onChange={(e) => setTempEducation({...tempEducation, grade: e.target.value})}
                                                placeholder="Enter grade"
                                            />
                                        </EditableField>
                                    </>
                                )}
                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                    <Button onClick={handleEducationSave}><FaCheck /> Save</Button>
                                    <Button onClick={() => setIsEditingEducation(false)}><FaTimes /> Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {profile.student === 'college' ? (
                                    <>
                                        <FieldValue><strong>College:</strong> {profile.college || 'Not specified'}</FieldValue>
                                        <FieldValue><strong>Degree:</strong> {profile.degree || 'Not specified'}</FieldValue>
                                        <FieldValue><strong>Field of Study:</strong> {profile.fieldOfStudy || 'Not specified'}</FieldValue>
                                    </>
                                ) : (
                                    <>
                                        <FieldValue><strong>School:</strong> {profile.school || 'Not specified'}</FieldValue>
                                        <FieldValue><strong>Grade:</strong> {profile.grade || 'Not specified'}</FieldValue>
                                    </>
                                )}
                            </div>
                        )}
                    </InfoSection>

                    {/* Interests Section */}
                    <InfoSection>
                        <SectionTitle>
                            Interests
                            <Button onClick={() => setIsEditingInterests(!isEditingInterests)}>
                                {isEditingInterests ? <FaTimes /> : <FaEdit />}
                            </Button>
                        </SectionTitle>
                        {isEditingInterests ? (
                            <div>
                                <TagContainer>
                                    {tempInterests.map((interest, index) => (
                                        <Tag key={index}>
                                            {interest}
                                            <span className="remove-tag" onClick={() => removeInterest(index)}>
                                                <FaTimes />
                                            </span>
                                        </Tag>
                                    ))}
                                </TagContainer>
                                <TagInputWrapper>
                                    <AddTagInput
                                        value={newInterest}
                                        onChange={(e) => setNewInterest(e.target.value)}
                                        placeholder="Add an interest..."
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                                    />
                                    <Button onClick={addInterest}>Add</Button>
                                </TagInputWrapper>
                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                    <Button onClick={handleInterestsSave}><FaCheck /> Save</Button>
                                    <Button onClick={() => setIsEditingInterests(false)}><FaTimes /> Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <TagContainer>
                                {profile.interests && profile.interests.length > 0 ? 
                                    profile.interests.map((interest, index) => (
                                        <Tag key={index}>{interest}</Tag>
                                    )) : 
                                    <FieldValue>No interests added yet.</FieldValue>
                                }
                            </TagContainer>
                        )}
                    </InfoSection>

                    {/* Goals Section */}
                    <InfoSection>
                        <SectionTitle>
                            Goals
                            <Button onClick={() => setIsEditingGoals(!isEditingGoals)}>
                                {isEditingGoals ? <FaTimes /> : <FaEdit />}
                            </Button>
                        </SectionTitle>
                        {isEditingGoals ? (
                            <div>
                                <TagContainer>
                                    {tempGoals.map((goal, index) => (
                                        <Tag key={index}>
                                            {goal}
                                            <span className="remove-tag" onClick={() => removeGoal(index)}>
                                                <FaTimes />
                                            </span>
                                        </Tag>
                                    ))}
                                </TagContainer>
                                <TagInputWrapper>
                                    <AddTagInput
                                        value={newGoal}
                                        onChange={(e) => setNewGoal(e.target.value)}
                                        placeholder="Add a goal..."
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                                    />
                                    <Button onClick={addGoal}>Add</Button>
                                </TagInputWrapper>
                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                    <Button onClick={handleGoalsSave}><FaCheck /> Save</Button>
                                    <Button onClick={() => setIsEditingGoals(false)}><FaTimes /> Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <TagContainer>
                                {profile.goals && profile.goals.length > 0 ? 
                                    profile.goals.map((goal, index) => (
                                        <Tag key={index}>{goal}</Tag>
                                    )) : 
                                    <FieldValue>No goals added yet.</FieldValue>
                                }
                            </TagContainer>
                        )}
                    </InfoSection>
                </ProfileInfo>
            )}

            {activeTab === 'sent' && (
                <RequestsList>
                    <h3>Sent Connection Requests</h3>
                    {sentRequests.length > 0 ? (
                        sentRequests.map((request) => (
                            <ConnectionRequestCard
                                key={request._id}
                                request={request}
                                type="sent"
                                onUpdate={fetchSentRequests}
                            />
                        ))
                    ) : (
                        <p>No connection requests sent yet.</p>
                    )}
                </RequestsList>
            )}

            {activeTab === 'received' && (
                <RequestsList>
                    <h3>Received Connection Requests</h3>
                    {receivedRequests.length > 0 ? (
                        receivedRequests.map((request) => (
                            <ConnectionRequestCard
                                key={request._id}
                                request={request}
                                type="received"
                                onUpdate={fetchReceivedRequests}
                            />
                        ))
                    ) : (
                        <p>No connection requests received yet.</p>
                    )}
                </RequestsList>
            )}
        </ProfileContainer>
    );
};

export default ProfilePage;